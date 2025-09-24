import "../fps-counter.js";
import { createProgram, createMesh } from "../utils/index.js";
import mapUrl from "./map.png";
const {
  glMatrix: { mat4, vec3 },
} = window;

const canvas = document.getElementById("canvas");
const fpsCounter = document.querySelector("fps-counter");
/** @type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 not supported");
}

gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

const program = createProgram(
  gl,
  `#version 300 es
  layout(location = 0) in vec3 pos;
  layout(location = 1) in vec3 inColor;

  uniform mat4 u_viewProj;
  uniform mat4 u_model;

  out vec3 fragColor;

  void main() {
    // Coordinates x, y, z.
    // W is the scale factor.
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#homogeneous_coordinates
    gl_Position = u_viewProj * u_model * vec4(pos, 1.0);

    fragColor = inColor;
  }`,
  `#version 300 es
  precision highp float;
  in vec3 fragColor;
  out vec4 outColor;

  void main() {
    outColor = vec4(fragColor, 1.0);
  }`,
);

const UVtestProgram = createProgram(
  gl,
  `#version 300 es
  layout(location=0) in vec2 aPos;
  layout(location=1) in vec2 aUV;
  out vec2 vUV;
  uniform mat4 u_viewProj;
  
  void main() {
    vUV = aUV;
    gl_Position = u_viewProj * vec4(aPos, 0.0, 1.0);
  }`,
  `#version 300 es
  precision mediump float;
  
  in vec2 vUV;
  out vec4 outColor;
  uniform sampler2D uTex;

  void main() {
    outColor = texture(uTex, vUV);
  }`,
);

// Локация юниформа у текстурной программы (кешируем один раз)
const uTexLoc = gl.getUniformLocation(UVtestProgram, "uTex");

// Создаём текстуру и задаём безопасные параметры (NPOT-friendly)
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);

// Пока картинка не загрузилась — плейсхолдер 1×1
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  new Uint8Array([128, 128, 128, 255]),
);

// Параметры фильтрации/обёртки (без мипов)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

// Грузим изображение
const img = new Image();
img.src = mapUrl;
img.onload = () => {
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // обычно нужно, чтобы UV не были вверх ногами
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  // мипмапы не генерим — так проще и работает для любых размеров
  gl.bindTexture(gl.TEXTURE_2D, null);
};

const duckMesh = createMesh(gl, {
  vertices: new Float32Array([
    -0.547, 0.785, 1.0, 0.85, 0.0, -0.267, 0.897, 1.0, 0.85, 0.0, -0.013, 0.804,
    1.0, 0.85, 0.0, 0.158, 0.567, 1.0, 0.85, 0.0, 0.16, 0.34, 1.0, 0.85, 0.0,
    0.008, 0.131, 1.0, 0.85, 0.0, 0.461, -0.016, 1.0, 0.85, 0.0, 0.779, 0.006,
    1.0, 0.85, 0.0, 0.461, -0.713, 1.0, 0.85, 0.0, 0.003, -0.857, 1.0, 0.85,
    0.0, -0.44, -0.713, 1.0, 0.85, 0.0, -0.623, -0.358, 1.0, 0.85, 0.0, -0.438,
    -0.012, 1.0, 0.85, 0.0, -0.272, 0.04, 1.0, 0.85, 0.0, -0.552, 0.137, 1.0,
    0.85, 0.0, -0.552, 0.137, 0.973, 0.514, 0.125, -0.794, 0.103, 0.973, 0.514,
    0.125, -0.697, 0.302, 0.973, 0.514, 0.125, -0.697, 0.302, 1.0, 0.85, 0.0,
    -0.705, 0.573, 1.0, 0.85, 0.0,
  ]),
  indices: new Uint16Array([
    2, 1, 0, 3, 2, 0, 4, 3, 0, 5, 4, 0, 8, 6, 5, 8, 7, 6, 8, 5, 0, 13, 12, 8,
    12, 11, 8, 11, 10, 8, 10, 9, 8, 13, 8, 0, 0, 19, 18, 14, 13, 0, 17, 16, 15,
    18, 14, 0,
  ]),
  attributes: [
    {
      location: 0,
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 5 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
    {
      location: 1,
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 5 * Float32Array.BYTES_PER_ELEMENT,
      offset: 2 * Float32Array.BYTES_PER_ELEMENT,
    },
  ],
});
const cubeMesh = createMesh(gl, {
  // prettier-ignore
  vertices: new Float32Array([
    0.5, 0.5, -0.5, 1.0, 1.0, 0.0,
    0.5, 0.5, 0.5, 1.0, 1.0, 1.0,
    -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    -0.5, 0.5, 0.5, 0.0, 1.0, 1.0,
    0.5, -0.5, -0.5, 1.0, 0.0, 0.0,
    0.5, -0.5, 0.5, 1.0, 0.0, 1.0,
    -0.5, -0.5, -0.5, 0.0, 0.0, 0.0,
    -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,
  ]),
  // prettier-ignore
  indices: new Uint16Array([
    2, 1, 0, 2, 3, 1, // top
    4, 5, 6, 7, 6, 5, // bottom
    6, 3, 2, 6, 7, 3, // left
    0, 1, 4, 1, 5, 4, // right
    1, 7, 5, 7, 1, 3, // front
    4, 2, 0, 4, 6, 2, // back
   ]),
  attributes: [
    {
      location: 0,
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 6 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
    {
      location: 1,
      size: 3,
      type: gl.FLOAT,
      normalized: false,
      stride: 6 * Float32Array.BYTES_PER_ELEMENT,
      offset: 3 * Float32Array.BYTES_PER_ELEMENT,
    },
  ],
});

const triangleMesh = createMesh(gl, {
  vertices: new Float32Array([
    -0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, 0.5, 0.5, 1, 1, -0.5, 0.5, 0, 1,
  ]),
  indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  attributes: [
    {
      location: 0,
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 4 * Float32Array.BYTES_PER_ELEMENT,
      offset: 0,
    },
    {
      location: 1,
      size: 2,
      type: gl.FLOAT,
      normalized: false,
      stride: 4 * 4,
      offset: 2 * Float32Array.BYTES_PER_ELEMENT,
    },
  ],
});

const V = mat4.create();
const P = mat4.create();
const VP = mat4.create();
const eye = vec3.fromValues(0, 0, 5);
const target = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);

duckMesh.matrix = mat4.create();
cubeMesh.matrix = mat4.create();
mat4.translate(cubeMesh.matrix, cubeMesh.matrix, vec3.fromValues(1.25, 1, 0));
mat4.translate(duckMesh.matrix, duckMesh.matrix, vec3.fromValues(-1.25, 1, 0));

gl.useProgram(program);
const viewProjLocation = gl.getUniformLocation(program, "u_viewProj");
const modelLocation = gl.getUniformLocation(program, "u_model");

gl.uniformMatrix4fv(viewProjLocation, false, VP);
gl.useProgram(null);

const render = () => {
  const error = gl.getError();

  if (error !== gl.NO_ERROR) {
    console.error("WebGL error:", error);
    return;
  }

  // Clear the canvas
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the geometry
  gl.useProgram(program);
  gl.uniformMatrix4fv(viewProjLocation, false, VP);

  gl.bindVertexArray(duckMesh.vao);
  gl.uniformMatrix4fv(modelLocation, false, duckMesh.matrix);
  gl.drawElements(
    gl.TRIANGLES, // mode
    duckMesh.indexCount, // count
    gl.UNSIGNED_SHORT, // type
    0, // offset
  );
  gl.disableVertexAttribArray(1);
  gl.vertexAttrib3f(1, 0.0, 0.0, 0.0);
  gl.drawElements(
    gl.LINE_LOOP, // mode
    duckMesh.indexCount, // count
    gl.UNSIGNED_SHORT, // type
    0, // offset
  );
  gl.enableVertexAttribArray(1);

  gl.bindVertexArray(cubeMesh.vao);
  gl.uniformMatrix4fv(modelLocation, false, cubeMesh.matrix);
  gl.vertexAttrib3f(1, 0.0, 0.0, 0.0);
  gl.drawElements(
    gl.TRIANGLES, // mode
    cubeMesh.indexCount, // count
    gl.UNSIGNED_SHORT, // type
    0, // offset
  );

  gl.useProgram(UVtestProgram);
  gl.uniformMatrix4fv(
    gl.getUniformLocation(UVtestProgram, "u_viewProj"),
    false,
    VP,
  );
  // Привязываем текстуру к юниту 0 и сообщаем шейдеру
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(uTexLoc, 0);

  gl.bindVertexArray(triangleMesh.vao);
  gl.drawElements(
    gl.TRIANGLES, // mode
    triangleMesh.indexCount, // count
    gl.UNSIGNED_SHORT, // type
    0, // offset
  );

  gl.bindVertexArray(null);
};

const resize = () => {
  const { devicePixelRatio = 1, innerWidth, innerHeight } = window;
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  gl.viewport(0, 0, canvas.width, canvas.height);

  const aspect = canvas.width / canvas.height;
  // fov, aspect, near, far
  mat4.perspective(P, (60 * Math.PI) / 180, aspect, 3.5, 6.0);
  mat4.lookAt(V, eye, target, up);
  // VP = P * V
  mat4.multiply(VP, P, V);

  render();
};
window.addEventListener("resize", resize);

window.addEventListener("mousemove", (e) => {
  const { innerWidth, innerHeight } = window;
  target[0] += e.movementX / innerWidth;
  target[1] -= e.movementY / innerHeight;

  mat4.lookAt(V, eye, target, up);
  mat4.multiply(VP, P, V);
});

let last = 0;

// 5.3 Animation loop
/** @type {FrameRequestCallback} */
const animate = (time) => {
  fpsCounter?.update(time);

  const dt = (time - last) * 0.001;
  last = time;

  mat4.rotateZ(duckMesh.matrix, duckMesh.matrix, 0.9 * dt);
  mat4.rotateX(cubeMesh.matrix, cubeMesh.matrix, 0.6 * dt);
  mat4.rotateY(cubeMesh.matrix, cubeMesh.matrix, 0.2 * dt);
  mat4.rotateZ(cubeMesh.matrix, cubeMesh.matrix, 0.4 * dt);

  render();
  requestAnimationFrame(animate);
};

// 6. Start the animation loop
resize();
requestAnimationFrame(animate);

// 7. Cleanup resources on page unload
const cleanup = () => {
  gl.deleteProgram(program);
  duckMesh.dispose();
};
window.addEventListener("unload", cleanup);
