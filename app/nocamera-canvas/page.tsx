"use client";

import React, { useEffect, useRef } from 'react';
import { useAnimationFrame, animate } from 'framer-motion';

const NoAudioCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null);
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null);
  const textureLocationRef = useRef<WebGLUniformLocation | null>(null);
  const circleSizeRef = useRef<number>(50);
  const offscreenCanvasRef = useRef<OffscreenCanvas | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    offscreenCanvasRef.current = offscreenCanvas;
    const gl = offscreenCanvas.getContext('webgl2');
    if (!gl) return;
    glRef.current = gl;

    // Set canvas sizes
    const setCanvasSize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Set 2D canvas size
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set OffscreenCanvas size
      offscreenCanvas.width = width * dpr;
      offscreenCanvas.height = height * dpr;
      gl.viewport(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, `#version 300 es
      in vec4 position;
      out vec2 v_texCoord;
      void main() {
        gl_Position = position;
        v_texCoord = position.xy * 0.5 + 0.5;
      }
    `);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, `#version 300 es
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform sampler2D u_texture;
      in vec2 v_texCoord;
      out vec4 fragColor;

      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / u_resolution.xy;
        float t = u_time * 0.5;
        float t1 = sin(t) * 3.0 + 0.5;
        float t2 = cos(t) * 1.0 + 2.5;
        
        float r = sin(2.0 * uv.x + t1) * 0.5 + 0.5;
        float g = cos(3.0 * uv.y + t2) * 0.5 + 0.5;
        float b = sin(1.448 * (uv.x + uv.y) + t1 + t2) * 0.5 + 0.5;
        vec3 rgbColor = vec3(r, g, b);
        vec3 white = vec3(1.0);
        float gradient = smoothstep(0.0, 1.0, (uv.x + (1.0 - uv.y)) * 0.5);
        vec3 gradientColor = mix(rgbColor, white, gradient);
        vec3 finalColor = mix(rgbColor, gradientColor, 0.948);
        fragColor = vec4(finalColor, 1.0);
      }

      void main() {
        vec4 textColor = texture(u_texture, v_texCoord);
        mainImage(fragColor, gl_FragCoord.xy);
        fragColor = mix(fragColor, textColor, textColor.a);
      }
    `);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    programRef.current = program;

    // Create vertices for a full-screen quad
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');

    timeLocationRef.current = timeLocation;
    resolutionLocationRef.current = resolutionLocation;
    textureLocationRef.current = textureLocation;

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture from WebGL content
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, offscreenCanvas.width, offscreenCanvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textureRef.current = texture;

    animate(circleSizeRef.current, 200, {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      onUpdate: (latest) => {
        circleSizeRef.current = latest;
      }
    });

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  useAnimationFrame(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    const timeLocation = timeLocationRef.current;
    const resolutionLocation = resolutionLocationRef.current;
    const textureLocation = textureLocationRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !texture || !timeLocation || !resolutionLocation || !textureLocation || !offscreenCanvas || !canvas) return;

    const time = (Date.now() - startTimeRef.current) * 0.001;

    // Draw WebGL content to the offscreen canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(program);
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, offscreenCanvas.width, offscreenCanvas.height);
    gl.uniform1i(textureLocation, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Update 2D context with WebGL content
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw WebGL texture to 2D canvas
      ctx.drawImage(offscreenCanvas.transferToImageBitmap(), 0, 0);

      // Draw text
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.font = `${30 * (window.devicePixelRatio || 1)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Username', canvas.width / 2, canvas.height / 2);

      // Draw circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, circleSizeRef.current, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  return (
    <canvas ref={canvasRef} style={{ width: '100%', aspectRatio: '16/9' }} />
  );
};

export default NoAudioCanvas;