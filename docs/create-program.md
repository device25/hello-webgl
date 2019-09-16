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
