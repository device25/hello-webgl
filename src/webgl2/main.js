import { createProgram } from "../utils/create-program.js";

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

  uniform mat3 u_matrix;

  out vec3 fragColor;

  void main() {
    // Coordinates x, y, z.
    // W is the scale factor.
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#homogeneous_coordinates
    gl_Position = vec4((u_matrix * vec3(pos.x, -pos.y, 0.0)), 1.0);

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
// 3.1 Vertex data
// Each vertex consists of 2 position components (x, y) and 3 color components (r, g, b)
const numComponents = 5;
const data = new Float32Array([
  -0.547, -0.785, 1.0, 0.85, 0.0, -0.267, -0.897, 1.0, 0.85, 0.0, -0.013,
  -0.804, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0, -0.013, -0.804, 1.0,
  0.85, 0.0, 0.158, -0.567, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0,
  0.158, -0.567, 1.0, 0.85, 0.0, 0.16, -0.34, 1.0, 0.85, 0.0, -0.547, -0.785,
  1.0, 0.85, 0.0, 0.16, -0.34, 1.0, 0.85, 0.0, 0.008, -0.131, 1.0, 0.85, 0.0,
  0.461, 0.016, 1.0, 0.85, 0.0, 0.779, -0.006, 1.0, 0.85, 0.0, 0.461, 0.713,
  1.0, 0.85, 0.0, 0.008, -0.131, 1.0, 0.85, 0.0, 0.461, 0.016, 1.0, 0.85, 0.0,
  0.461, 0.713, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0, 0.008, -0.131,
  1.0, 0.85, 0.0, 0.461, 0.713, 1.0, 0.85, 0.0, 0.461, 0.713, 1.0, 0.85, 0.0,
  0.003, 0.857, 1.0, 0.85, 0.0, -0.44, 0.713, 1.0, 0.85, 0.0, 0.461, 0.713, 1.0,
  0.85, 0.0, -0.44, 0.713, 1.0, 0.85, 0.0, -0.623, 0.358, 1.0, 0.85, 0.0, 0.461,
  0.713, 1.0, 0.85, 0.0, -0.623, 0.358, 1.0, 0.85, 0.0, -0.438, 0.012, 1.0,
  0.85, 0.0, 0.461, 0.713, 1.0, 0.85, 0.0, -0.438, 0.012, 1.0, 0.85, 0.0,
  -0.272, -0.04, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0, 0.461, 0.713,
  1.0, 0.85, 0.0, -0.272, -0.04, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0,
  -0.272, -0.04, 1.0, 0.85, 0.0, -0.552, -0.137, 1.0, 0.85, 0.0, -0.552, -0.137,
  0.973, 0.514, 0.125, -0.794, -0.103, 0.973, 0.514, 0.125, -0.697, -0.302,
  0.973, 0.514, 0.125, -0.547, -0.785, 1.0, 0.85, 0.0, -0.552, -0.137, 1.0,
  0.85, 0.0, -0.697, -0.302, 1.0, 0.85, 0.0, -0.697, -0.302, 1.0, 0.85, 0.0,
  -0.705, -0.573, 1.0, 0.85, 0.0, -0.547, -0.785, 1.0, 0.85, 0.0,
]);
const dataLength = data.length;

// 3.2 Create and bind VBO
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(
  gl.ARRAY_BUFFER, // target
  data, // data
  gl.STATIC_DRAW, // usage
);

// 3.3 Create and set up VAO
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(
  0, // attribute location
  2, // number of elements per attribute
  gl.FLOAT, // type of elements
  false, // normalized
  numComponents * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  0, // offset from the beginning of a single vertex to this attribute
);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(
  1, // attribute location
  3, // number of elements per attribute
  gl.FLOAT, // type of elements
  false, // normalized
  numComponents * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
  2 * Float32Array.BYTES_PER_ELEMENT, // offset from the beginning of a single vertex to this attribute
);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindVertexArray(null);

// 4. Uniform setup
gl.useProgram(program);
const timeLocation = gl.getUniformLocation(program, "u_time");

gl.uniform1f(timeLocation, 0.0);
const matrixLocation = gl.getUniformLocation(program, "u_matrix");
// prettier-ignore
const matrix = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
]);
gl.uniformMatrix3fv(matrixLocation, false, matrix);
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the geometry
  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.drawArrays(
    gl.TRIANGLES, // mode
    0, // starting index in the enabled arrays
    dataLength / numComponents, // number of vertices to be rendered
  );
};

// 5.2 Handle resizing
const resize = () => {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  gl.viewport(0, 0, canvas.width, canvas.height);
  render();
};
window.addEventListener("resize", resize);

// 5.3 Animation loop
/** @type {FrameRequestCallback} */
const animate = (time) => {
  // convert to seconds
  time *= 0.001;

  // Update matrix for rotation
  const angle = time * 0.5;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // prettier-ignore
  matrix.set([
    sin, -cos, 0,
    cos, sin, 0,
    0, 0, 1,
  ]);
  gl.uniformMatrix3fv(matrixLocation, false, matrix);

  // Update time uniform
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
