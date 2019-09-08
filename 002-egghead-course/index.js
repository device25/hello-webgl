function map(value, minSrc, maxSrc, minDst, maxDst) {
  return (value - minSrc) / (maxSrc - minSrc) * (maxDst - minDst) + minDst;
}

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
      gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    const coordsLocation = gl.getAttribLocation(shaderProgram, 'coords');
    // gl.vertexAttrib3f(coordsLocation, ...coords);
    gl.vertexAttribPointer(
      coordsLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordsLocation);
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const pointSizeLocation = gl.getAttribLocation(shaderProgram, 'pointSize');
    gl.vertexAttrib1f(pointSizeLocation, pointSize);

    const colorLocation = gl.getUniformLocation(shaderProgram, 'color');
    gl.uniform4f(colorLocation, ...color);
  }

  _onMouseMove = (event) => {
    this.mouseX = map(event.clientX, 0, this.canvas.width, -1, 1);
    this.mouseY = map(event.clientY, 0, this.canvas.height, 1, -1);
  };

  draw = () => {
    const { gl, mode, vertexCount } = this;

    for (let i = 0; i < vertexCount * 2; i += 2) {
      const dx = this.vertices[i] - this.mouseX;
      const dy = this.vertices[i + 1] - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.2) {
        this.vertices[i] = this.mouseX + dx / dist * 0.2;
        this.vertices[i + 1] = this.mouseY + dy / dist * 0.2;
      } else {
        this.vertices[i] += Math.random() * 0.01 - 0.005;
        this.vertices[i + 1] += Math.random() * 0.01 - 0.005;
      }
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl[mode], 0, vertexCount);

    requestAnimationFrame(this.draw);
  };
}

const canvas = document.getElementById('canvas');
const props = {
  coords: [0.2, 0, 0],
  pointSize: 2.0,
  color: [0.0, 1.0, 1.0, 1.0],
  vertices: [],
  /**
   * POINTS
   * LINES || LINE_STRIP || LINE_LOOP
   * TRIANGLES
   * */
  mode: 'POINTS',
  vertexCount: 50000,
  canvas
};

for (let i = 0; i < props.vertexCount; i += 1) {
  props.vertices.push(Math.random() * 2 - 1);
  props.vertices.push(Math.random() * 2 - 1);
}

const main = new Main(props);

main.draw();
