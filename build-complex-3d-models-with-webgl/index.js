import { createProgram } from "../utils/create-program.js";

class Cube {
  _matrix = window.mat4.create(); // http://glmatrix.net/

  constructor(props) {
    this._canvas = props.canvas;
    this._gl = this._canvas.getContext("webgl");
    this._vertexCount = props.vertexCount;

    this._initGL();
    this._createShaders();
    this._createVertices();
    this._createIndices();
    // this._loadTexture();
  }

  _initGL() {
    const realToCSSPixels = window.devicePixelRatio;

    /**
     * Берём заданный браузером размер canvas в CSS-пикселях и вычисляем нужный
     * нам размер, чтобы буфер отрисовки совпадал с ним в действительных
     * пикселях
     * */
    const displayWidth = Math.floor(this._canvas.clientWidth * realToCSSPixels);
    const displayHeight = Math.floor(
      this._canvas.clientHeight * realToCSSPixels,
    );

    //  проверяем, отличается ли размер canvas
    if (
      this._gl.canvas.width !== displayWidth ||
      this._gl.canvas.height !== displayHeight
    ) {
      // подгоняем размер буфера отрисовки под размер HTML-элемента
      this._gl.canvas.width = displayWidth;
      this._gl.canvas.height = displayHeight;
    }

    this._gl.enable(this._gl.DEPTH_TEST);
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._gl.clearColor(0, 0, 0, 1);
  }

  _createShaders() {
    const vertexSource = `
      attribute vec4 coords;
      uniform mat4 transformMatrix;
      attribute vec3 normal;
      uniform vec3 lightColor;
      uniform vec3 lightDirection;
      uniform mat4 perspectiveMatrix;
      varying vec4 varyingColors;

      void main(void) {
        vec3 norm = normalize(normal);
        vec3 ld = normalize(lightDirection);
        float dotProduct = max(dot(norm, ld), 0.0);
        vec3 vertexColor = lightColor * vec3(1, 1, 0) * dotProduct;
        varyingColors = vec4(vertexColor, 1.0);
        
        gl_Position = perspectiveMatrix * transformMatrix * coords;
      }  
    `;

    // mediump NOT medium
    const fragmentSource = `
      precision mediump float;
      varying vec4 varyingColors;

      void main(void) {
        gl_FragColor = varyingColors;
      }
    `;

    this._shaderProgram = createProgram(this._gl, vertexSource, fragmentSource);
  }

  _createVertices() {
    // prettier-ignore
    const vertices = [
      -1, -1, -1, // 0
       1, -1, -1, // 1
      -1,  1, -1, // 2
       1,  1, -1, // 3
      -1,  1,  1, // 4
       1,  1,  1, // 5
      -1, -1,  1, // 6
       1, -1,  1  // 7
    ];

    this._vertexCount = vertices.length / 3;

    const buffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(vertices),
      this._gl.STATIC_DRAW,
    );

    const coordsLocation = this._gl.getAttribLocation(
      this._shaderProgram,
      "coords",
    );
    this._gl.vertexAttribPointer(
      coordsLocation,
      3,
      this._gl.FLOAT,
      false,
      0,
      0,
    );
    this._gl.enableVertexAttribArray(coordsLocation);

    // prettier-ignore
    const normals = [
       0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
       0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
       0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,
       0, -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,
      -1,  0,  0, -1,  0,  0, -1,  0,  0, -1,  0,  0,
       1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0
    ];

    const normalBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, normalBuffer);
    this._gl.bufferData(
      this._gl.ARRAY_BUFFER,
      new Float32Array(normals),
      this._gl.STATIC_DRAW,
    );

    const normalLocation = this._gl.getAttribLocation(
      this._shaderProgram,
      "normal",
    );
    this._gl.vertexAttribPointer(
      normalLocation,
      3,
      this._gl.FLOAT,
      false,
      0,
      0,
    );
    this._gl.enableVertexAttribArray(normalLocation);

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);

    this._gl.useProgram(this._shaderProgram);
    const lightColorLocation = this._gl.getUniformLocation(
      this._shaderProgram,
      "lightColor",
    );
    this._gl.uniform3f(lightColorLocation, 1, 1, 1);
    const lightDirectionLocation = this._gl.getUniformLocation(
      this._shaderProgram,
      "lightDirection",
    );
    this._gl.uniform3f(lightDirectionLocation, 0.5, 1.0, 0.1);

    const perspectiveMatrix = window.mat4.create();
    window.mat4.perspective(
      perspectiveMatrix,
      1,
      this._canvas.width / this._canvas.height,
      0.1,
      11,
    );

    const perspectiveLocation = this._gl.getUniformLocation(
      this._shaderProgram,
      "perspectiveMatrix",
    );
    this._gl.uniformMatrix4fv(perspectiveLocation, false, perspectiveMatrix);

    window.mat4.translate(this._matrix, this._matrix, [0, 0, -4]);
  }

  _createIndices() {
    // prettier-ignore
    const indices = [
      0, 1, 2, 1, 2, 3,
      2, 3, 4, 3, 4, 5,
      4, 5, 6, 5, 6, 7,
      6, 7, 0, 7, 0, 1,
      0, 2, 6, 2, 6, 4,
      1, 3, 7, 3, 7, 5
    ];
    this._indexCount = indices.length;

    const indexBuffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this._gl.bufferData(
      this._gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(indices),
      this._gl.STATIC_DRAW,
    );
  }

  draw = () => {
    window.mat4.rotateX(this._matrix, this._matrix, 0.004);
    window.mat4.rotateY(this._matrix, this._matrix, 0.01);
    window.mat4.rotateZ(this._matrix, this._matrix, 0.007);

    const transformMatrixLocation = this._gl.getUniformLocation(
      this._shaderProgram,
      "transformMatrix",
    );
    this._gl.uniformMatrix4fv(transformMatrixLocation, false, this._matrix);

    this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    // this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, this._vertexCount);
    this._gl.drawElements(
      this._gl.TRIANGLES,
      this._indexCount,
      this._gl.UNSIGNED_BYTE,
      0,
    );

    requestAnimationFrame(this.draw);
  };
}

const props = {
  canvas: document.getElementById("canvas"),
  vertexCount: 36,
};

const cube = new Cube(props);
cube.draw();
