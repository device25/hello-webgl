function createShader(gl, type, source) {
  /** создание шейдера */
  const shader = gl.createShader(type);

  /** устанавливаем шейдеру его программный код */
  gl.shaderSource(shader, source);
  /** компилируем шейдер */
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  /** если компиляция прошла успешно - возвращаем шейдер */
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function main() {
  const canvas = document.getElementById('c');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('webgl not supported');
    return;
  }

  const vertexShaderSource =
    document.getElementById('2d-vertex-shader').text;
  const fragmentShaderSource =
    document.getElementById('2d-fragment-shader').text;

  const vertexShader =
    createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader =
    createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = createProgram(gl, vertexShader, fragmentShader);
}

main();
