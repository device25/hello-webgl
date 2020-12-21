class Main {
  mouseX = 0;

  mouseY = 0;

  constructor(props) {
    const {
      coords, pointSize, color, vertices, mode, vertexCount, canvas
    } = props;

    this.canvas = canvas;
    this.gl = this.canvas.getContext('webgl');
    this.mode = mode;
    this.vertices = vertices;
    this.vertexCount = vertexCount;

    this._initGL();
    this._createShaders();
    this._createVertices(coords, pointSize, color);

    this.canvas.addEventListener('mousemove', this._onMouseMove);
  }

  _initGL() {
    const realToCSSPixels = window.devicePixelRatio;
    const { gl, canvas } = this;

    /**
     * Берём заданный браузером размер canvas в CSS-пикселях и вычисляем нужный
     * нам размер, чтобы буфер отрисовки совпадал с ним в действительных
     * пикселях
     * */
    const displayWidth =
      Math.floor(canvas.clientWidth * realToCSSPixels);
    const displayHeight =
      Math.floor(canvas.clientHeight * realToCSSPixels);

    //  проверяем, отличается ли размер canvas
    if (gl.canvas.width !== displayWidth
      || gl.canvas.height !== displayHeight) {

      // подгоняем размер буфера отрисовки под размер HTML-элемента
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
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
      gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    const coordsLocation = gl.getAttribLocation(shaderProgram, 'coords');
    gl.vertexAttribPointer(
      coordsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordsLocation);

    const pointSizeLocation = gl.getAttribLocation(shaderProgram, 'pointSize');
    gl.vertexAttrib1f(pointSizeLocation, pointSize);

    const colorLocation = gl.getUniformLocation(shaderProgram, 'color');
    gl.uniform4f(colorLocation, ...color);
  }

  draw = () => {
    const { gl, mode, vertexCount } = this;

    // for (let i = 0; i < vertexCount * 2; i += 2) {
      // const totalPoints=1;

      const angle= 2 * Math.PI / 0.5;

      console.log(Math.cos(angle));
//    const x = startX + radius * Math.cos(angle);
//    const y = startY + radius * Math.sin(angle);
//    vertices.push(x, y);
      
      this.vertices[0] += 0.5 * Math.cos(angle) * 0.05;
      this.vertices[1] += 0.5 * Math.sin(angle) * 0.05;
      // this.vertices[i] = Math.cos(i * Math.PI) * 0.01 - 0.005;
      // this.vertices[i + 1] = Math.sin(i * Math.PI) * 0.01 - 0.005;
    // }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl[mode], 0, vertexCount);

    requestAnimationFrame(this.draw);
  };
}

const canvas = document.getElementById('canvas');
const props = {
  coords: [0.2, 0, 0],
  pointSize: 10.0,
  color: [0.0, 1.0, 1.0, 1.0],
  vertices: [],
  /**
   * POINTS
   * LINES || LINE_STRIP || LINE_LOOP
   * TRIANGLES
   * */
  mode: 'POINTS',
  vertexCount: 1,
  canvas
};

for (let i = 0; i < props.vertexCount; i += 1) {
  // props.vertices.push(Math.random() * 2 - 1);
  // props.vertices.push(Math.random() * 2 - 1);
  props.vertices.push(0);
  props.vertices.push(0);
}

const main = new Main(props);

main.draw();
