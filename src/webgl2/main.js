import { createProgram } from "../utils/create-program.js";
const { mat4, vec3 } = window;

// 1. WebGL2 context setup
const canvas = document.getElementById("canvas");
/** @type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 not supported");
}

// 2. Shader program setup
// 2.1 Shader source code
const vertexShaderSource = `#version 300 es
  layout(location = 0) in vec2 pos;
  layout(location = 1) in vec3 inColor;

  uniform mat4 u_matrix;

  out vec3 fragColor;

  void main() {
    // Coordinates x, y, z.
    // W is the scale factor.
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#homogeneous_coordinates
    gl_Position = vec4(u_matrix * vec4(pos, 0.0, 1.0));

    fragColor = gl_Position.y > 0.1 ? inColor : vec3(gl_Position.xy * 0.5 + 0.5, 0.0);
}`;
const fragmentShaderSource = `#version 300 es
  precision highp float;
  in vec3 fragColor;

  uniform float u_time;
  out vec4 outColor;

  void main() {
    // rainbow effect with time uniform
    float r = abs(sin(u_time * 3.0 + fragColor.r * 5.0));
    float g = abs(sin(u_time * 3.0 + fragColor.g * 5.0 + 2.0));
    float b = abs(sin(u_time * 3.0 + fragColor.b * 5.0 + 4.0));
    outColor = vec4(r, g, b, 1.0);
}`;

// 2.2 Shader compilation and program linking
const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

// 3. Buffer and attribute setup
// 3.1 Create and bind VAO (Vertex Array Object)
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// 3.2 Create and bind VBO (Vertex Buffer Object) for vertex data
// Each vertex consists of 2 position components (x, y) and 3 color components (r, g, b)
const numComponents = 5;
const data = new Float32Array([
  -0.547, 0.785, 1.0, 0.85, 0.0, -0.267, 0.897, 1.0, 0.85, 0.0, -0.013, 0.804,
  1.0, 0.85, 0.0, 0.158, 0.567, 1.0, 0.85, 0.0, 0.16, 0.34, 1.0, 0.85, 0.0,
  0.008, 0.131, 1.0, 0.85, 0.0, 0.461, -0.016, 1.0, 0.85, 0.0, 0.779, 0.006,
  1.0, 0.85, 0.0, 0.461, -0.713, 1.0, 0.85, 0.0, 0.003, -0.857, 1.0, 0.85, 0.0,
  -0.44, -0.713, 1.0, 0.85, 0.0, -0.623, -0.358, 1.0, 0.85, 0.0, -0.438, -0.012,
  1.0, 0.85, 0.0, -0.272, 0.04, 1.0, 0.85, 0.0, -0.552, 0.137, 1.0, 0.85, 0.0,
  -0.552, 0.137, 0.973, 0.514, 0.125, -0.794, 0.103, 0.973, 0.514, 0.125,
  -0.697, 0.302, 0.973, 0.514, 0.125, -0.697, 0.302, 1.0, 0.85, 0.0, -0.705,
  0.573, 1.0, 0.85, 0.0,
]);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

// Upload the vertex data to the GPU
gl.bufferData(
  gl.ARRAY_BUFFER, // target
  data, // data
  gl.STATIC_DRAW, // usage
);

// 3.3 Define vertex attributes
// Position attribute
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(
  0, // attribute location
  2, // number of elements per attribute
  gl.FLOAT, // type of elements
  false, // normalized
  numComponents * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  0, // offset from the beginning of a single vertex to this attribute
);
// Color attribute
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(
  1, // attribute location
  3, // number of elements per attribute
  gl.FLOAT, // type of elements
  false, // normalized
  numComponents * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  2 * Float32Array.BYTES_PER_ELEMENT, // offset from the beginning of a single vertex to this attribute
);

// 3.4 Create and bind EBO (Element Buffer Object) for index data
const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 6, 7, 8, 5, 6, 8, 0, 5, 8, 8, 9, 10, 8,
  10, 11, 8, 11, 12, 8, 12, 13, 0, 8, 13, 0, 13, 14, 15, 16, 17, 0, 14, 18, 18,
  19, 0,
]);

const ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Unbind VAO
gl.bindVertexArray(null);
// Unbind VBO
gl.bindBuffer(gl.ARRAY_BUFFER, null);
// Note: Do not unbind the EBO while the VAO is bound, as the VAO stores the EBO binding

const P = mat4.create();
const V = mat4.create();
const VP = mat4.create();
const M = mat4.create();
const MVP = mat4.create();

const eye = vec3.fromValues(0, 0, 0.5);
const target = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);

// 4. Uniform setup
// 4.1 Get uniform locations and set initial values
gl.useProgram(program);
const timeLocation = gl.getUniformLocation(program, "u_time");
gl.uniform1f(timeLocation, 0.0);

const matrixLocation = gl.getUniformLocation(program, "u_matrix");

mat4.multiply(MVP, VP, M);

gl.uniformMatrix4fv(matrixLocation, false, MVP);
gl.useProgram(null);

// 5. Rendering and animation loop
// 5.1 Render function with error checking
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
  gl.bindVertexArray(vao);
  gl.drawElements(
    gl.TRIANGLES, // mode
    indices.length, // count
    gl.UNSIGNED_SHORT, // type
    0, // offset
  );
  gl.bindVertexArray(null);
};

// 5.2 Handle resizing
const resize = () => {
  const { devicePixelRatio = 1, innerWidth, innerHeight } = window;
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  gl.viewport(0, 0, canvas.width, canvas.height);

  const aspect = canvas.width / canvas.height;
  // fov, aspect, near, far
  mat4.perspective(P, (120 * Math.PI) / 180, aspect, 0.01, 100.0);
  mat4.lookAt(V, eye, target, up);
  // VP = P * V
  mat4.multiply(VP, P, V);

  render();
};
window.addEventListener("resize", resize);

window.addEventListener("mousemove", (e) => {
  const { innerWidth, innerHeight } = window;
  const x = (e.x / innerWidth) * 2 - 1;
  const y = (e.y / innerHeight) * -2 + 1;

  mat4.lookAt(V, eye, vec3.fromValues(x, y, target[2]), up);
  mat4.multiply(VP, P, V);
});

// 5.3 Animation loop
/** @type {FrameRequestCallback} */
const animate = (time) => {
  // convert to seconds
  time *= 0.001;

  gl.useProgram(program);

  mat4.rotateY(M, M, 0.003);
  mat4.multiply(MVP, VP, M);

  gl.uniformMatrix4fv(matrixLocation, false, MVP);
  gl.uniform1f(timeLocation, (Math.sin(time) + 1) / 2);

  render();
  requestAnimationFrame(animate);
};

// 6. Start the animation loop
resize();
requestAnimationFrame(animate);

// 7. Cleanup resources on page unload
const cleanup = () => {
  gl.deleteProgram(program);
  gl.deleteBuffer(vbo);
  gl.deleteVertexArray(vao);
};
window.addEventListener("unload", cleanup);
