import { createShader } from "./create-shader.js";

/**
 * Helper function for creating and linking a WebGL program
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
 * @param {WebGL2RenderingContext} gl webgl context
 * @param {string} vertexShaderSource vertex shader source code
 * @param {string} fragmentShaderSource fragment shader source code
 * @throws Error if shader compilation or program linking fails
 * @returns {WebGLProgram}
 */
export const createProgram = (gl, vertexShaderSource, fragmentShaderSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${error}`);
  }

  // Clean up shaders as they are no longer needed after linking
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
};
