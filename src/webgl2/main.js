// WebGL2 context initialization with error checking
const canvas = document.getElementById("canvas");
/** @type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL2 not supported");
}

// Shader source code
const vertexShaderSource = `#version 300 es
  in vec2 pos;
  in vec3 inColor;

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

// Helper function for shader compilation
const createShader = (type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);

    throw new Error(`Shader compilation failed: ${error}`);
  }

  return shader;
};

// Shader compilation
const vs = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

// Program linking with error checking
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  const error = gl.getProgramInfoLog(program);
  gl.deleteProgram(program);

  throw new Error(`Program linking failed: ${error}`);
}

// Cleanup shaders after linking
gl.detachShader(program, vs);
gl.detachShader(program, fs);
gl.deleteShader(vs);
gl.deleteShader(fs);

let vertices = [
  -0.547, -0.785, -0.267, -0.897, -0.013, -0.804, -0.547, -0.785, -0.013,
  -0.804, 0.158, -0.567, -0.547, -0.785, 0.158, -0.567, 0.16, -0.34, -0.547,
  -0.785, 0.16, -0.34, 0.008, -0.131, 0.461, 0.016, 0.779, -0.006, 0.461, 0.713,
  0.008, -0.131, 0.461, 0.016, 0.461, 0.713, -0.547, -0.785, 0.008, -0.131,
  0.461, 0.713, 0.461, 0.713, 0.003, 0.857, -0.44, 0.713, 0.461, 0.713, -0.44,
  0.713, -0.623, 0.358, 0.461, 0.713, -0.623, 0.358, -0.438, 0.012, 0.461,
  0.713, -0.438, 0.012, -0.272, -0.04, -0.547, -0.785, 0.461, 0.713, -0.272,
  -0.04, -0.547, -0.785, -0.272, -0.04, -0.552, -0.137, -0.552, -0.137, -0.794,
  -0.103, -0.697, -0.302, -0.547, -0.785, -0.552, -0.137, -0.697, -0.302,
  -0.697, -0.302, -0.705, -0.573, -0.547, -0.785,
];

let colors = [
  1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85,
  0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0,
  0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0,
  1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85,
  0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0,
  0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0,
  1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85,
  0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0,
  0.85, 0.0, 1.0, 0.85, 0.0, 0.973, 0.514, 0.125, 0.973, 0.514, 0.125, 0.973,
  0.514, 0.125, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0, 1.0, 0.85, 0.0,
  1.0, 0.85, 0.0, 1.0, 0.85, 0.0,
];

// prettier-ignore
const matrix = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
]);

// attribute setup
// one buffer for all vertex data and color data
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([...vertices, ...colors]),
  gl.STATIC_DRAW,
);
const positionAttributeLocation = gl.getAttribLocation(program, "pos");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(
  positionAttributeLocation,
  2, // size (num components)
  gl.FLOAT, // type of data in buffer
  false, // normalize
  0, // stride (0 = auto)
  0, // offset in bytes
);
const colorAttributeLocation = gl.getAttribLocation(program, "inColor");
gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(
  colorAttributeLocation,
  3, // size (num components)
  gl.FLOAT, // type of data in buffer
  false, // normalize
  0, // stride (0 = auto)
  vertices.length * Float32Array.BYTES_PER_ELEMENT, // offset in bytes
);

// matrix setup
const matrixLocation = gl.getUniformLocation(program, "u_matrix");
// time uniform setup
const timeLocation = gl.getUniformLocation(program, "u_time");

// should use program
gl.useProgram(program);
gl.uniformMatrix3fv(matrixLocation, false, matrix);
gl.uniform1f(timeLocation, 0.0);

// Cleanup function
const cleanup = () => {
  gl.deleteBuffer(positionBuffer);
  gl.deleteProgram(program);
};

// Add cleanup on page unload
window.addEventListener("unload", cleanup);

// Render function with error checking
const render = () => {
  gl.useProgram(program);
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error("WebGL error:", error);
    return;
  }
  gl.drawArrays(gl.TRIANGLES, 0, 48);
};

// Set up canvas size and viewport
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

// Initial setup
resize();
render();

const animate = (now) => {
  // convert to seconds
  now *= 0.001;

  // Update matrix for rotation
  const angle = now * 0.5;
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
  gl.uniform1f(timeLocation, (Math.sin(now) + 1) / 2);

  render();
  requestAnimationFrame(animate);
};
requestAnimationFrame(animate);
