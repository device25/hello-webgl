await import("https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js");
import { createProgram } from "../utils/create-program.js";

window.mapboxgl.accessToken =
  "pk.eyJ1IjoiZGV2aWNlMjUiLCJhIjoiY2lzaGN3d2tiMDAxOTJ6bGYydDZrcHptdiJ9.UK55aUzBquqYns1AdnuTQg";

const map = new window.mapboxgl.Map({
  container: "map",
  zoom: 3,
  center: [7.5, 58],
  style: "mapbox://styles/mapbox/standard",
  config: {
    basemap: {
      theme: "monochrome",
    },
  },
  antialias: true,
  projection: "mercator",
});

const highlightLayer = {
  id: "highlight",
  type: "custom",
  slot: "bottom",

  /**
   * @param {WebGL2RenderingContext} gl
   * */
  onAdd(map, gl) {
    const vs = `#version 300 es 
      uniform mat4 u_matrix;
      in vec2 a_pos;

      void main(){
        gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
      }
  `;

    const fs = `#version 300 es
      precision highp float;
      out vec4 outColor;

      void main(){
        outColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;

    this.program = createProgram(gl, vs, fs);

    const helsinki = window.mapboxgl.MercatorCoordinate.fromLngLat({
      lng: 25.004,
      lat: 60.239,
    });
    const berlin = window.mapboxgl.MercatorCoordinate.fromLngLat({
      lng: 13.403,
      lat: 52.562,
    });
    const kyiv = window.mapboxgl.MercatorCoordinate.fromLngLat({
      lng: 30.498,
      lat: 50.541,
    });

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        helsinki.x,
        helsinki.y,
        berlin.x,
        berlin.y,
        kyiv.x,
        kyiv.y,
      ]),
      gl.STATIC_DRAW,
    );

    this.aPos = gl.getAttribLocation(this.program, "a_pos");
    this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.aPos);
    gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  },

  /**
   * @param {WebGL2RenderingContext} gl
   * */
  render(gl, matrix) {
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uMatrix, false, matrix);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.LINE_STRIP, 0, 3);
    gl.bindVertexArray(null);
  },
};

map.on("load", () => {
  map.addLayer(highlightLayer);
});
