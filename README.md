# Hello WebGL

[001](./src/001-webgl-fundamentals) – [WebGL Fundamentals](https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html)

[002](./src/002-egghead-course) – [Create 3D Graphics in JavaScript Using WebGL](https://egghead.io/lessons/webgl-setting-up-webgl)

[003](./src/003-build-complex-3d-models-with-webgl) – [Build Complex 3D models with WebGL](https://egghead.io/courses/build-complex-3d-models-with-webgl)

## Development

```shell
npm ci
npm run start
```

## How To

### Init WebGL Context

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Hello WebGL</title>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script src="main.js"></script>
  </body>
</html>
```

```js
// main.js
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
```

### Create Program

This simple program will draw red 10 pixel dot at the center of canvas. 

```js
const vertexSource = `
  void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
  }
`;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);

gl.shaderSource(vertexShader, vertexSource);
gl.compileShader(vertexShader);

const fragmentSource = `
  precision mediump float;  

  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(fragmentShader, fragmentSource);
gl.compileShader(fragmentShader);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);
```

### Draw Arrays

Clear canvas and draw one point.

```js
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```
