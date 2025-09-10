/**
 * Helper function for shader compilation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context
 * @param {WebGL2RenderingContext} gl webgl context
 * @param {"gl.FRAGMENT_SHADER" | "gl.VERTEX_SHADER"} type
 * should be webgl constant like gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @param {string} source shader source code
 * @throws Error if shader compilation fails
 * @returns {WebGLShader}
 */
export const createShader = (gl, type, source) => {
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
