"use client";

import React, { useEffect, useRef } from 'react';

const NoAudioCanvas = () => {
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (!glCanvas) return;
    
    const gl = glCanvas.getContext('webgl2');
    if (!gl) return;

    // Create OffscreenCanvas for 2D drawing
    const offscreenCanvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    // Set canvas sizes
    const setCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Set WebGL canvas size
      glCanvas.width = width;
      glCanvas.height = height;
      gl.viewport(0, 0, width, height);
      
      // Set OffscreenCanvas size
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Audio Available', width / 2, height / 2);
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

    // Create vertices for a full-screen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Create texture from OffscreenCanvas
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreenCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      
      // Update texture with OffscreenCanvas content
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreenCanvas);

      gl.useProgram(program);
      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, glCanvas.width, glCanvas.height);
      gl.uniform1i(textureLocation, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <canvas ref={glCanvasRef} style={{ position: 'absolute', width: '100%', height: '100%' }} />
    </div>
  );
};

export default NoAudioCanvas;