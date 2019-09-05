function initGl(gl, width, height) {
  gl.viewport(0, 0, width, height);
  gl.clearColor(1, 1, 1, 1);
}

function createShaders(gl) {
  const vertexSource = `
    void main() {
      gl_Position = vec4(0.5, 0.5, 0, 1);
      gl_PointSize = 100.0;
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexSource);
  gl.compileShader(vertexShader);

  const fragmentSource = `
    void main() {
      gl_FragColor = vec4(1.0, 0, 0, 1);
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

  return shaderProgram;
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);
}

function main() {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  initGl(gl, canvas.width, canvas.height);
  createShaders(gl);
  draw(gl);
}

main();
