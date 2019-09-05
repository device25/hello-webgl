class Main {
  canvas = document.getElementById('canvas');

  gl = this.canvas.getContext('webgl');

  constructor(props) {
    const { coords, pointSize, color, vertices, mode } = props;
    this.mode = mode;
    this.vertices = vertices;

    this._initGL();
    this._createShaders();
    this._createVertices(coords, pointSize, color);
  }

  _initGL() {
    const { gl, canvas } = this;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 1, 1);
  }

  _createShaders() {
    const { gl } = this;

    const vertexSource = `
      attribute vec4 coords;
      attribute float pointSize;
    
      void main() {
        gl_Position = coords;
        gl_PointSize = pointSize;
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);

    // mediump NOT medium
    const fragmentSource = `
      precision mediump float;
      uniform vec4 color;
      
      void main() {
        gl_FragColor = color;
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

    this.shaderProgram = shaderProgram;
  }

  _createVertices(coords, pointSize, color) {
    const { gl, shaderProgram, vertices } = this;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const coordsLocation = gl.getAttribLocation(shaderProgram, 'coords');
    // gl.vertexAttrib3f(coordsLocation, ...coords);
    gl.vertexAttribPointer(
      coordsLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordsLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const pointSizeLocation = gl.getAttribLocation(shaderProgram, 'pointSize');
    gl.vertexAttrib1f(pointSizeLocation, pointSize);

    const colorLocation = gl.getUniformLocation(shaderProgram, 'color');
    gl.uniform4f(colorLocation, ...color);
  }

  draw() {
    const { gl, mode } = this;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl[mode], 0, 3);
    gl.drawArrays(gl[mode], 7, 3);
  }
}

const props = {
  coords: [0.2, 0, 0],
  pointSize: 3.0,
  color: [0.0, 1.0, 1.0, 1.0],
  vertices: [
    -0.9, 0.5, 0,
    -0.7, -0.5, 0,
    -0.5, 0.5, 0,
    -0.3, -0.5, 0,
    -0.1, 0.5, 0,
    0.1, -0.5, 0,
    0.3, 0.5, 0,
    0.5, -0.5, 0,
    0.7, 0.5, 0,
    0.9, -0.5, 0
  ],
  /**
   * POINTS
   * LINES || LINE_STRIP || LINE_LOOP
   * TRIANGLES
   * */
  mode: 'LINE_STRIP'
};
const main = new Main(props);

main.draw();
