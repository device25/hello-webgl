/**
 * Creates a mesh for WebGL.
 * @param {WebGL2RenderingContext} gl - The WebGL2 context.
 * @param {{
 *  vertices: Float32Array,
 *  indices: Uint16Array | Uint32Array,
 *  attributes: Array<{
 *    location: number,
 *    size: number,
 *    type: GLenum,
 *    normalized: boolean,
 *    stride: number,
 *    offset: number
 *  }>
 * }} options - Options for creating the mesh.
 * @returns {{
 *  vao: WebGLVertexArrayObject,
 *  indexCount: number,
 *  dispose(): void}} The VAO, index count, and dispose method.
 */
export const createMesh = (gl, { vertices, indices, attributes }) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  const indexCount = indices.length;

  attributes.forEach(({ location, size, type, normalized, stride, offset }) => {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
  });

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return {
    vao,
    indexCount,
    dispose() {
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ebo);
    },
  };
};
