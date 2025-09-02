# Hello WebGL

A collection of WebGL examples and projects.

## Getting Started

### Installation

```shell
yarn
```

### Development

```shell
yarn vite ./src/...
```

## Basic WebGL Example

### 1. Setup HTML

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello WebGL</title>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script src="main.js"></script>
  </body>
</html>
```

### 2. Initialize WebGL Context

```js
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
```

### 3. Create Shader Program

This program draws a red 10-pixel dot at the center of the canvas.

```js
const vertexSource = `
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
`;
const fragmentSource = `
  precision mediump float;  

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

// Create vertex shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexSource);
gl.compileShader(vertexShader);

// Create fragment shader
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentSource);
gl.compileShader(fragmentShader);

// Link shaders into program
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);
```

### 4. Render

```js
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```

## Projects

### Tutorials

- [WebGL Fundamentals](./src/webgl-fundamentals)
  - Based on [webglfundamentals.org](https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html)
- [Create 3D Graphics in JavaScript Using WebGL](./src/create-3d-graphics-in-javascript-using-webgl)
  - Based on [Egghead.io course](https://egghead.io/lessons/webgl-setting-up-webgl)
- [Build Complex 3D models with WebGL](./src/build-complex-3d-models-with-webgl)
  - Based on [Egghead.io course](https://egghead.io/courses/build-complex-3d-models-with-webgl)

### Examples

- [Mapbox Custom Layer](./src/mapbox-custom-layer) - Custom WebGL2 layer implementation for Mapbox GL JS
