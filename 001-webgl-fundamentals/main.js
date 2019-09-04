/**
 * @see {@link https://webglfundamentals.org/webgl/lessons/ru/webgl-resizing-the-canvas.html}
 * */
function resize(gl) {
  const realToCSSPixels = window.devicePixelRatio;

  // Берём заданный браузером размер canvas в CSS-пикселях и вычисляем нужный
  // нам размер, чтобы буфер отрисовки совпадал с ним в действительных пикселях
  const displayWidth = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
  const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

  //  проверяем, отличается ли размер canvas
  if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {

    // подгоняем размер буфера отрисовки под размер HTML-элемента
    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  }
}

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

  return null;
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

  return null;
}

// возврат случайного целого числа значением от 0 до range-1
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// заполнение буфера значениями, которые определяют прямоугольник
function setRectangle(gl, x, y, width, height) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  /**
   * ПРИМ.: gl.bufferData(gl.ARRAY_BUFFER, ...) воздействует
   * на буфер, который привязан к точке привязке `ARRAY_BUFFER`,
   * но таким образом у нас будет один буфер. Если бы нам понадобилось
   * несколько буферов, нам бы потребовалось привязать их сначала к
   * `ARRAY_BUFFER`.
   */
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2]), gl.STATIC_DRAW);
}

async function main() {
  const canvas = document.getElementById('c');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('webgl not supported');
    return;
  }

  const vertexShaderSource = await fetch('./index.vertex.glsl')
    .then(res => res.text());
  const fragmentShaderSource = await fetch('./index.fragment.glsl')
    .then(res => res.text());

  const vertexShader =
    createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader =
    createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = createProgram(gl, vertexShader, fragmentShader);
  const positionAttributeLocation =
    gl.getAttribLocation(program, 'a_position');
  const resolutionUniformLocation =
    gl.getUniformLocation(program, 'u_resolution');
  const colorUniformLocation =
    gl.getUniformLocation(program, 'u_color');

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  /**
   * code above this line is initialization code.
   * code below this line is rendering code.
   * */

  resize(gl);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // очищаем canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // говорим использовать нашу программу (пару шейдеров)
  gl.useProgram(program);

  // установка разрешения
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  gl.enableVertexAttribArray(positionAttributeLocation);

  // Привязываем буфер положений
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
  // 2 компоненты на итерацию
  const size = 2;
  // наши данные - 32-битные числа с плавающей точкой
  const type = gl.FLOAT;
  // не нормализовать данные
  const normalize = false;
  /* 0 = перемещаться на size * sizeof(type) каждую итерацию для получения
  следующего положения */
  const stride = 0;
  // начинать с начала буфера
  const offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset
  );


  // на каждое движение мышки
  // создаём 50 прямоугольников в произвольных местах со случайным цветом
  window.onmousemove = () => {
    for (let ii = 0; ii < 5; ii += 1) {
      // задаём произвольный прямоугольник
      // Запись будет происходить в positionBuffer,
      // так как он был привязан последник к
      // точке связи ARRAY_BUFFER
      setRectangle(
        gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300)
      );

      // задаём случайный цвет
      gl.uniform4f(
        colorUniformLocation, Math.random(), Math.random(), Math.random(), 1
      );

      // отрисовка прямоугольника
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  };
}

main();
