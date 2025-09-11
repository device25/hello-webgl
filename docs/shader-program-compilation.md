# Shader Program Compilation (WebGL2)

This guide focuses on compiling shaders and linking a program in WebGL2 with clear error handling.

## 1. Write shaders

WebGL2 uses GLSL ES 3.00 with explicit `#version` and user-defined outputs for the fragment shader.

```js
const vertexSource = `#version 300 es
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
`;

const fragmentSource = `#version 300 es
  precision highp float;
  out vec4 outColor;
  void main() {
    outColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;
```

## 2. Compile and link (two options)

### Option A — Use project helper

There is a helper at `src/utils/create-program.js` that compiles, links, checks errors, then detaches and deletes shaders.

```js
import { createProgram } from "./src/utils/create-program.js";
const program = createProgram(gl, vertexSource, fragmentSource);
gl.useProgram(program);
```

### Option B — Manual compilation with checks

```js
function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${info}`);
  }
  return shader;
}

const vs = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const info = gl.getProgramInfoLog(program);
  gl.deleteProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  throw new Error(`Program link failed: ${info}`);
}

// Optional validation
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
  console.warn("Program validation:", gl.getProgramInfoLog(program));
}

// Shaders no longer needed after linking
gl.detachShader(program, vs);
gl.detachShader(program, fs);
gl.deleteShader(vs);
gl.deleteShader(fs);

gl.useProgram(program);
```
