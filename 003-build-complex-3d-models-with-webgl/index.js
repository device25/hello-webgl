class Triangles {
  _matrix = window.mat4.create(); // http://glmatrix.net/

  constructor(props) {
    this._canvas = props.canvas;
    this._gl = this._canvas.getContext('webgl');
    this._vertexCount = props.vertexCount;

    this._initGL();
    this._createShaders();
    this._createVertices();
  }

  _initGL() {
    const realToCSSPixels = window.devicePixelRatio;

    /**
     * Берём заданный браузером размер canvas в CSS-пикселях и вычисляем нужный
     * нам размер, чтобы буфер отрисовки совпадал с ним в действительных
     * пикселях
     * */
    const displayWidth =
      Math.floor(this._canvas.clientWidth * realToCSSPixels);
    const displayHeight =
      Math.floor(this._canvas.clientHeight * realToCSSPixels);

    //  проверяем, отличается ли размер canvas
    if (this._gl.canvas.width !== displayWidth
      || this._gl.canvas.height !== displayHeight) {

      // подгоняем размер буфера отрисовки под размер HTML-элемента
      this._gl.canvas.width = displayWidth;
      this._gl.canvas.height = displayHeight;
    }

    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._gl.clearColor(0, 0, 0.6, 1);
  }

  _createShaders() {
    const vertexSource = `
      attribute vec4 coords;
      attribute float pointSize;
      uniform mat4 transformMatrix;
      uniform mat4 perspectiveMatrix;
      attribute vec4 colors;
      varying vec4 varyingColors;

      void main(void) {
        gl_Position = perspectiveMatrix * transformMatrix * coords;
        gl_PointSize = pointSize;
        varyingColors = colors;
      }
    `;

    const vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
    this._gl.shaderSource(vertexShader, vertexSource);
    this._gl.compileShader(vertexShader);

    // mediump NOT medium
    const fragmentSource = `
      precision mediump float;
      uniform vec4 colors;
      varying vec4 varyingColors;
      
      void main(void) {
        gl_FragColor = varyingColors;
      }
    `;

    const fragmentShader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
    this._gl.shaderSource(fragmentShader, fragmentSource);
    this._gl.compileShader(fragmentShader);

    this._shaderProgram = this._gl.createProgram();
    this._gl.attachShader(this._shaderProgram, vertexShader);
    this._gl.attachShader(this._shaderProgram, fragmentShader);
    this._gl.linkProgram(this._shaderProgram);
    this._gl.useProgram(this._shaderProgram);
  }

  _createVertices() {
    const vertices = [];
    vertices.push(0, 0.9, 0.3, 1, 1, 1, 1);

    for (let i = 0; i < Math.PI * 2; i += 0.01) {
      vertices.push(Math.cos(i));
      vertices.push(Math.sin(i));
      vertices.push(Math.sin(i * 10) * 0.1);

      vertices.push(Math.sin(i * 10) * 0.5 + 0.5);
      vertices.push(Math.sin(i * 8) * 0.5 + 0.5);
      vertices.push(Math.sin(i * 12) * 0.5 + 0.5);
      vertices.push(1);
    }

    const i = Math.PI * 2;
    vertices.push(Math.cos(i));
    vertices.push(Math.sin(i));
    vertices.push(Math.sin(i * 10) * 0.1);

    vertices.push(Math.sin(i * 10) * 0.5 + 0.5);
    vertices.push(Math.sin(i * 8) * 0.5 + 0.5);
    vertices.push(Math.sin(i * 12) * 0.5 + 0.5);
    vertices.push(1);

    this._vertexCount = vertices.length / 7;

    const buffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);

    const coordsLocation =
      this._gl.getAttribLocation(this._shaderProgram, 'coords');
    this._gl.vertexAttribPointer(
      coordsLocation,
      3,
      this._gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      0
    );
    this._gl.enableVertexAttribArray(coordsLocation);

    const colorsLocation =
      this._gl.getAttribLocation(this._shaderProgram, 'colors');
    this._gl.vertexAttribPointer(
      colorsLocation,
      4,
      this._gl.FLOAT,
      false,
      Float32Array.BYTES_PER_ELEMENT * 7,
      Float32Array.BYTES_PER_ELEMENT * 3
    );
    this._gl.enableVertexAttribArray(colorsLocation);
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

    const pointSize =
      this._gl.getAttribLocation(this._shaderProgram, 'pointSize');
    this._gl.vertexAttrib1f(pointSize, 20);

    const perspectiveMatrix = window.mat4.create();
    window.mat4.perspective(
      perspectiveMatrix,
      1,
      this._canvas.width / this._canvas.height,
      0.1,
      11
    );

    const perspectiveLocation =
      this._gl.getUniformLocation(this._shaderProgram, 'perspectiveMatrix');
    this._gl.uniformMatrix4fv(perspectiveLocation, false, perspectiveMatrix);

    window.mat4.translate(this._matrix, this._matrix, [0, 0, -2]);
  }

  draw = () => {
    window.mat4.rotateX(this._matrix, this._matrix, 0.01);
    window.mat4.rotateY(this._matrix, this._matrix, 0.01);
    window.mat4.rotateZ(this._matrix, this._matrix, 0.01);

    const transformMatrixLocation =
      this._gl.getUniformLocation(this._shaderProgram, 'transformMatrix');
    this._gl.uniformMatrix4fv(transformMatrixLocation, false, this._matrix);

    this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    this._gl.drawArrays(this._gl.TRIANGLE_FAN, 0, this._vertexCount);

    requestAnimationFrame(this.draw);
  };
}

const props = {
  canvas: document.getElementById('canvas'),
  vertexCount: 36
};

const triangles = new Triangles(props);
triangles.draw();
