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

async function main() {
  const canvas = document.getElementById('c');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.log('webgl not supported');
    return;
  }

  const vertexShaderSource = await fetch('./triangle.vertex.glsl')
    .then(res => res.text());
  const fragmentShaderSource = await fetch('./triangle.fragment.glsl')
    .then(res => res.text());

  const vertexShader =
    createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader =
    createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = createProgram(gl, vertexShader, fragmentShader);
  const positionAttributeLocation =
    gl.getAttribLocation(program, 'a_position');

  const positionBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  /**
   * Здесь происходит несколько вещей. Сперва у нас есть JavaScript-массив
   * positions. Но для WebGL нужны строго типизированные данные, поэтому нам
   * нужно явно создать массив 32-битных чисел с плавающей точкой через
   * new Float32Array(positions), куда скопируются значения из массива
   * positions. Далее gl.bufferData копирует типизированные данные в
   * positionBuffer на видеокарте. Копирование происходит в буфер положений,
   * потому что мы привязали его к точке связи ARRAY_BUFFER выше.
   * Через последний аргумент gl.STATIC_DRAW мы указываем, как WebGL должен
   * использовать данные. WebGL может использовать эту подсказку для оптимизации
   * определённых вещей. gl.STATIC_DRAW говорит о том, что скорей всего мы
   * не будем менять эти данные.
   * */
  const positions = [
    0, 0,
    0, 0.5,
    0.7, 0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

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

  const primitiveType = gl.TRIANGLES;
  const count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();
