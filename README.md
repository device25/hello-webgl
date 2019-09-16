# Hello WebGL

[001](https://github.com/device25/hello-webgl/tree/master/001-webgl-fundamentals) – [WebGL Fundamentals](https://webglfundamentals.org/webgl/lessons/webgl-fundamentals.html)

[002](https://github.com/device25/hello-webgl/tree/master/002-egghead-course) – [Create 3D Graphics in JavaScript Using WebGL](https://egghead.io/lessons/webgl-setting-up-webgl)

[003](https://github.com/device25/hello-webgl/tree/master/003-build-complex-3d-models-with-webgl) – [Build Complex 3D models with WebGL](https://egghead.io/courses/build-complex-3d-models-with-webgl)

## TLTR

### Init WebGL Context

```js
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
```

### Create Program

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

```js
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.POINTS, 0, 1);
```
