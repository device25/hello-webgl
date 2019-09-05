function initGl(gl, width, height) {
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 1, 1);
}

function draw(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function main() {
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');

  initGl(gl, canvas.width, canvas.height);
  draw(gl);
}

main();
