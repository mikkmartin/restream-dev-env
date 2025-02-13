import { transform } from 'motion'

const TWO_TRIANGLE_VERTEX_SHADER = `#version 300 es
  in vec4 position;
  out vec2 v_texCoord;
  void main() {
    gl_Position = position;
    v_texCoord = vec2(position.x * 0.5 + 0.5, 1.0 - (position.y * 0.5 + 0.5));
  }
  `

const DOWNSAMPLE_SCALE = 1 / 6
const BLUR_RADIUS = 16.0
const BACKGROUND_OPACITY = 0.8

export class CanvasCameraPlaceholderDrawer {
  private context: CanvasRenderingContext2D
  private startTime: number
  private offscreenCanvas: OffscreenCanvas
  private gl: WebGL2RenderingContext | null = null
  private program: WebGLProgram | null = null
  private timeLocation: WebGLUniformLocation | null = null
  private resolutionLocation: WebGLUniformLocation | null = null
  private soundLevelLocation: WebGLUniformLocation | null = null
  private circleSizeInnerLocation: WebGLUniformLocation | null = null

  private colorA: number[]
  private colorLocationA: WebGLUniformLocation | null = null

  private colorB: number[]
  private colorLocationB: WebGLUniformLocation | null = null
  private text: string = ''

  private circleProgress = 0
  private textProgress = 0
  private circleSizeInner = 0

  private avatarImage: HTMLImageElement | null = null
  private isAvatarLoaded = false
  private blurredAvatarBitmap: ImageBitmap | null = null

  private blurProgram: WebGLProgram | null = null
  private imageTexture: WebGLTexture | null = null
  private blurResolutionLocation: WebGLUniformLocation | null = null
  private blurRadiusLocation: WebGLUniformLocation | null = null
  private blurBackgroundOpacityLocation: WebGLUniformLocation | null = null

  public setCircleProgress(progress: number): void {
    this.circleProgress = progress
  }

  public setTextProgress(progress: number): void {
    this.textProgress = progress
  }

  public setCircleSizeInner(progress: number): void {
    this.circleSizeInner = progress
  }

  public setColor(colorHex: string, variant: 'A' | 'B'): void {
    const color = this.colorToFloat(colorHex)
    variant === 'A' ? (this.colorA = color) : (this.colorB = color)
    const colorLocation =
      variant === 'A' ? this.colorLocationA : this.colorLocationB
    this.gl?.uniform3fv(colorLocation, color)
  }

  public setTextValue(text: string): void {
    this.text = text
  }

  public setAvatarUrl(url: string): void {
    if (url) {
      this.loadAvatarImage(url)
    } else {
      this.avatarImage = null
      this.isAvatarLoaded = false
    }
  }

  public renderFrame(): void {
    this.clearCanvas()
    this.drawBackground()

    if (this.avatarImage && this.isAvatarLoaded) {
      this.drawImageAvatar()
    } else {
      this.drawTextAvatar()
    }
  }

  private clearCanvas(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawBackground(): void {
    const gl = this.gl!
    const ctx = this.context
    ctx.globalCompositeOperation = 'source-over'

    if (this.isAvatarLoaded && this.avatarImage) {
      // Use stored bitmap if available
      if (this.blurredAvatarBitmap) {
        this.drawImageCovered(
          ctx,
          this.blurredAvatarBitmap,
          0,
          0,
          this.canvas.width,
          this.canvas.height,
        )
        return
      }

      // Create downsampled version
      const tempCanvas = new OffscreenCanvas(
        this.canvas.width * DOWNSAMPLE_SCALE,
        this.canvas.height * DOWNSAMPLE_SCALE,
      )
      const tempCtx = tempCanvas.getContext('2d')!
      this.drawImageCovered(
        tempCtx,
        this.avatarImage,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      )

      // Generate blurred bitmap from downsampled image
      gl.useProgram(this.blurProgram!)
      gl.bindTexture(gl.TEXTURE_2D, this.imageTexture!)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        tempCanvas,
      )
      gl.uniform2f(
        this.blurResolutionLocation!,
        tempCanvas.width,
        tempCanvas.height,
      )
      gl.uniform1f(this.blurRadiusLocation!, BLUR_RADIUS)
      gl.uniform1f(this.blurBackgroundOpacityLocation!, BACKGROUND_OPACITY)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      // Store the blurred bitmap at full size
      const finalCanvas = new OffscreenCanvas(
        this.canvas.width,
        this.canvas.height,
      )
      const finalCtx = finalCanvas.getContext('2d')!
      finalCtx.drawImage(
        this.offscreenCanvas.transferToImageBitmap(),
        0,
        0,
        finalCanvas.width,
        finalCanvas.height,
      )
      this.blurredAvatarBitmap = finalCanvas.transferToImageBitmap()
      this.drawImageCovered(
        ctx,
        this.blurredAvatarBitmap,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      )
    } else {
      // Use gradient program when no avatar
      const program = this.program!
      const timeLocation = this.timeLocation!
      const resolutionLocation = this.resolutionLocation!
      const soundLevelLocation = this.soundLevelLocation!
      const circleSizeInnerLocation = this.circleSizeInnerLocation!
      const colorLocationA = this.colorLocationA!
      const colorLocationB = this.colorLocationB!
      const time = ((Date.now() - this.startTime) * 0.001) % 1000

      gl.useProgram(program)
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(
        resolutionLocation,
        this.offscreenCanvas.width,
        this.offscreenCanvas.height,
      )
      gl.uniform1f(soundLevelLocation, this.circleProgress)
      gl.uniform1f(circleSizeInnerLocation, this.circleSizeInner)
      gl.uniform3fv(colorLocationA, this.colorA)
      gl.uniform3fv(colorLocationB, this.colorB)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      ctx.drawImage(this.offscreenCanvas.transferToImageBitmap(), 0, 0)
    }
  }

  private drawTextAvatar(): void {
    this.context.save()
    // Draw text if no avatar is present
    const textSize =
      50 * (window.devicePixelRatio || 1) + this.textProgress * 120
    this.context.font = `${textSize}px Montserrat`
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.context.fillStyle = 'rgb(255, 255, 255)'

    const textPosX = this.canvas.width / 2
    const textPosY = this.canvas.height / 2

    this.context.globalCompositeOperation = 'overlay'
    ;[1, 2, 3].forEach(() =>
      this.context.fillText(this.text, textPosX, textPosY),
    )

    this.context.restore()
  }

  private drawImageAvatar(): void {
    const ctx = this.context
    // Draw circular avatar in the center
    const size = Math.min(this.canvas.width, this.canvas.height) * 0.5
    const x = this.canvas.width / 2
    const y = this.canvas.height / 2

    // First draw the outer circle with overlay
    ctx.save()
    ctx.globalCompositeOperation = 'overlay'
    ctx.beginPath()
    const circleSize = transform(
      this.circleProgress,
      [0, 1],
      [size * 0.4, size * 0.95],
    )

    // Create radial gradient
    const gradient = ctx.createRadialGradient(
      x,
      y,
      0, // Inner circle center and radius
      x,
      y,
      circleSize, // Outer circle center and radius
    )
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)')

    ctx.arc(x, y, circleSize, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.restore()

    // Then draw the clipped avatar
    ctx.save()
    const imageScale = transform(this.textProgress, [0, 1], [1, 1.02])

    // Calculate dimensions to fill the circle while maintaining aspect ratio
    const imageAspect = this.avatarImage!.width / this.avatarImage!.height
    const targetSize = size * imageScale
    let scaledWidth: number
    let scaledHeight: number

    if (imageAspect > 1) {
      // Image is wider than tall
      scaledHeight = targetSize
      scaledWidth = targetSize * imageAspect
    } else {
      // Image is taller than wide
      scaledWidth = targetSize
      scaledHeight = targetSize / imageAspect
    }

    const clipSize = transform(
      this.circleSizeInner,
      [0, 1],
      [size * 0.4, size * 0.5],
    )

    ctx.beginPath()
    ctx.arc(x, y, clipSize, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      this.avatarImage!,
      x - scaledWidth / 2,
      y - scaledHeight / 2,
      scaledWidth,
      scaledHeight,
    )
    ctx.restore()
  }

  private setupBlurProgram(avatarImage: HTMLImageElement) {
    const gl = this.gl!

    // Only setup blur program if it hasn't been set up yet
    if (!this.blurProgram) {
      const blurVertexShader = this.createShader(
        gl.VERTEX_SHADER,
        TWO_TRIANGLE_VERTEX_SHADER,
      )

      const blurFragmentShader = this.createShader(
        gl.FRAGMENT_SHADER,
        blurShader,
      )
      this.blurProgram = this.createProgram(
        blurVertexShader,
        blurFragmentShader,
      )

      // Get uniform locations
      this.blurResolutionLocation = gl.getUniformLocation(
        this.blurProgram,
        'u_resolution',
      )
      this.blurRadiusLocation = gl.getUniformLocation(
        this.blurProgram,
        'u_blur_radius',
      )
      this.blurBackgroundOpacityLocation = gl.getUniformLocation(
        this.blurProgram,
        'u_background_opacity',
      )
    }

    // Setup or update texture
    if (!this.imageTexture) {
      this.imageTexture = gl.createTexture()
    }

    gl.bindTexture(gl.TEXTURE_2D, this.imageTexture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      avatarImage,
    )

    // Set background opacity
    gl.uniform1f(this.blurBackgroundOpacityLocation, BACKGROUND_OPACITY)
  }

  private loadAvatarImage(url: string): void {
    this.avatarImage = new Image()
    this.avatarImage.crossOrigin = 'anonymous'
    this.avatarImage.onload = () => {
      this.isAvatarLoaded = true
      this.blurredAvatarBitmap = null // Reset bitmap when loading new image
      if (this.gl) {
        this.setupBlurProgram(this.avatarImage!)
      }
    }
    this.avatarImage.src = url
  }

  constructor(
    private readonly canvas: HTMLCanvasElement,
    options: {
      colors: [string, string]
      text: string
      avatarUrl?: string
    },
  ) {
    const context = canvas.getContext('2d')

    if (context === null) {
      throw new Error(
        'CanvasCameraPlaceholderDrawer creation error: Unable to get 2d context',
      )
    }

    this.context = context
    this.startTime = Date.now()
    this.offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    this.gl = this.offscreenCanvas.getContext('webgl2')

    if (!this.gl) {
      throw new Error(
        'CanvasCameraPlaceholderDrawer creation error: Unable to get webgl2 context',
      )
    }

    const [colorA, colorB] = options.colors.map((color) =>
      this.colorToFloat(color),
    )
    this.colorA = colorA ?? [1, 1, 1]
    this.colorB = colorB ?? [1, 1, 1]
    this.text = options.text
    this.initWebGL()

    if (options.avatarUrl) {
      this.loadAvatarImage(options.avatarUrl)
    }
  }

  private colorToFloat(color: string): number[] {
    return color.match(/\w\w/g)!.map((c) => parseInt(c, 16) / 255)
  }

  private initWebGL(): void {
    const gl = this.gl!
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, TWO_TRIANGLE_VERTEX_SHADER)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, gradientShader)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    this.program = program

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    this.timeLocation = gl.getUniformLocation(program, 'u_time')
    this.resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    this.soundLevelLocation = gl.getUniformLocation(program, 'u_soundLevel')
    this.circleSizeInnerLocation = gl.getUniformLocation(
      program,
      'u_circleSizeInner',
    )
    this.colorLocationA = gl.getUniformLocation(program, 'u_colorA')
    this.colorLocationB = gl.getUniformLocation(program, 'u_colorB')

    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl!
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`)
    }

    return shader
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): WebGLProgram {
    const gl = this.gl!
    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`)
    }

    return program
  }

  private drawImageCovered(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    image: CanvasImageSource,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    const imageAspect =
      (image as HTMLImageElement).width / (image as HTMLImageElement).height
    const canvasAspect = w / h
    let renderWidth = w
    let renderHeight = h
    let offsetX = 0
    let offsetY = 0

    if (imageAspect > canvasAspect) {
      // Image is wider than canvas
      renderWidth = h * imageAspect
      offsetX = -(renderWidth - w) / 2
    } else {
      // Image is taller than canvas
      renderHeight = w / imageAspect
      offsetY = -(renderHeight - h) / 2
    }

    ctx.drawImage(image, x + offsetX, y + offsetY, renderWidth, renderHeight)
  }
}

const blurShader = `#version 300 es
precision highp float;

uniform sampler2D u_image;
uniform vec2 u_resolution;
uniform float u_blur_radius;
uniform float u_background_opacity;
in vec2 v_texCoord;
out vec4 fragColor;

// Gaussian function implementation
float gaussian(vec2 i, float sigma) {
  return exp(-((i.x * i.x + i.y * i.y) / (2.0f * sigma * sigma)));
}

// Pseudo-random noise function
float rand(vec2 co) {
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec4 gaussianBlur2D(sampler2D tex, vec2 uv, vec2 scale) {
  vec4 color = vec4(0.0f);
  float accumWeight = 0.0f;
  const float k = 0.15915494f; // 1 / (2*PI)

    // Use blur radius to determine kernel size
  float kernelSize = 1.0f + u_blur_radius * 2.0f;
  float sigma = kernelSize / 2.0f;

  vec2 xy;
  for(float y = -kernelSize; y <= kernelSize; y += 1.0f) {
    xy.y = y;
    for(float x = -kernelSize; x <= kernelSize; x += 1.0f) {
      xy.x = x;
      float weight = (k / sigma) * gaussian(xy, sigma);
      vec2 offset = xy * scale;

            // Sample with bounds checking
      vec2 sampleUv = uv + offset;
      if(sampleUv.x >= 0.0f && sampleUv.x <= 1.0f &&
        sampleUv.y >= 0.0f && sampleUv.y <= 1.0f) {
        color += weight * texture(tex, sampleUv);
        accumWeight += weight;
      }
    }
  }

  return color / accumWeight;
}

void main() {
    // Calculate pixel size for proper scaling
  vec2 pixelSize = 1.0f / u_resolution;

    // Apply the 2D gaussian blur
  vec4 color = gaussianBlur2D(u_image, v_texCoord, pixelSize);

    // Add subtle noise to break up color banding
  float noise = (rand(gl_FragCoord.xy) - 0.4) * 0.002;
  
    // Dim the blurred background and add noise
  vec4 dimmedColor = color * u_background_opacity;
  fragColor = vec4(dimmedColor.rgb + vec3(noise), dimmedColor.a);
}`

const gradientShader = `#version 300 es
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_soundLevel;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform float u_circleSizeInner;
in vec2 v_texCoord;
out vec4 fragColor;

vec3 backgDropColor = vec3(0.0f);

float plot(vec2 st, float pct) {
  return smoothstep(pct - 0.005f, pct, st.y) -
    smoothstep(pct, pct + 0.005f, st.y);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898f, 78.233f))) * 43758.5453123f);
}

vec3 overlay(vec3 base, vec3 blend) {
  return mix(6.f * base * blend, 1.0f - 2.5f * (1.0f - base) * (1.0f - blend), step(0.5f, base));
}

float getBayerFromCoord(vec2 coord) {
  int x = int(mod(coord.x, 4.0f));
  int y = int(mod(coord.y, 4.0f));

    // Manually implement matrix lookup without arrays
  float dither = 0.0f;

  if(x == 0) {
    if(y == 0)
      dither = 0.0f;
    else if(y == 1)
      dither = 12.0f;
    else if(y == 2)
      dither = 3.0f;
    else if(y == 3)
      dither = 15.0f;
  } else if(x == 1) {
    if(y == 0)
      dither = 8.0f;
    else if(y == 1)
      dither = 4.0f;
    else if(y == 2)
      dither = 11.0f;
    else if(y == 3)
      dither = 7.0f;
  } else if(x == 2) {
    if(y == 0)
      dither = 2.0f;
    else if(y == 1)
      dither = 14.0f;
    else if(y == 2)
      dither = 1.0f;
    else if(y == 3)
      dither = 13.0f;
  } else if(x == 3) {
    if(y == 0)
      dither = 10.0f;
    else if(y == 1)
      dither = 6.0f;
    else if(y == 2)
      dither = 9.0f;
    else if(y == 3)
      dither = 5.0f;
  }

  return dither / 16.0f;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(0.0f);

  float yPos = sin(u_time * 2.f) * 0.02f + u_soundLevel * 0.2f;
  float t2 = cos(u_time * 2.f) * 0.15f + 1.f;
  float dist = distance(vec2(0.25f + t2 * 0.25f, 0.864f + yPos), st.xy) * (0.6f + yPos);
  vec3 pct = vec3(smoothstep(0.0f, 1.0f, dist), smoothstep(0.0f, 1.0f, dist), smoothstep(0.0f, 1.0f, dist));

  // Mix between colorA and u_colorA based on pct
  color = mix(backgDropColor, u_colorA, pct);
  // Mix the result with white based on the distance
  color = mix(color, u_colorB, smoothstep(0.390f, 1.0f, dist));

  // Add film-like noise
  float dither = getBayerFromCoord(gl_FragCoord.xy);
  color += random(st + dither * 2000.0f + u_time) * 0.01f;

  // Add pulsating outlined circle
  float circleSize = 4.5f + u_soundLevel * 5.5f; // Use u_soundLevel directly
  float innerCircleSize = min(4.5f + u_circleSizeInner * 5.0f, circleSize); // Ensure inner circle size does not exceed outer circle size
  float aspectRatio = u_resolution.x / u_resolution.y;
  vec2 center = vec2(0.5f, 0.5f);
  float circleDist = distance(st * vec2(aspectRatio, 1.0f), center * vec2(aspectRatio, 1.0f));

  float edgeSharpness = 0.002f;
  float strokeWidth = 0.054f;

  float innerCircle = smoothstep(innerCircleSize * 0.05f - edgeSharpness, innerCircleSize * 0.05f, circleDist);
  float outerCircle = smoothstep(circleSize * strokeWidth, circleSize * strokeWidth + edgeSharpness, circleDist);
  float circle = innerCircle - outerCircle;

  vec3 circleColor = overlay(color, vec3(1.0f) * circle);
  color = mix(color, circleColor, circle);

  fragColor = vec4(color, 1.0f);
}`
