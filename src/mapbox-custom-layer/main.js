/*global mapboxgl*/
await import("https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js");
import { createShader } from "../utils/create-shader.js";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGV2aWNlMjUiLCJhIjoiY2lzaGN3d2tiMDAxOTJ6bGYydDZrcHptdiJ9.UK55aUzBquqYns1AdnuTQg";

const map = new mapboxgl.Map({
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

    const vsObj = createShader(gl, gl.VERTEX_SHADER, vs);
    const fsObj = createShader(gl, gl.FRAGMENT_SHADER, fs);

    this.program = gl.createProgram();
    gl.attachShader(this.program, vsObj);
    gl.attachShader(this.program, fsObj);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program));
    }

    this.aPos = gl.getAttribLocation(this.program, "a_pos");
    this.uMatrix = gl.getUniformLocation(this.program, "u_matrix");

    const helsinki = mapboxgl.MercatorCoordinate.fromLngLat({
      lng: 25.004,
      lat: 60.239,
    });
    const berlin = mapboxgl.MercatorCoordinate.fromLngLat({
      lng: 13.403,
      lat: 52.562,
    });
    const kyiv = mapboxgl.MercatorCoordinate.fromLngLat({
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
