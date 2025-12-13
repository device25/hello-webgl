import assert from "node:assert/strict";
import test from "node:test";

import {
  createDroneLayer,
  extractTrackTuples,
  projectClip,
  toWorldPoints,
} from "./drone-layer.js";

test("projectClip multiplies coordinates by the 4x4 matrix", () => {
  const point = { x: 1, y: 2, z: 3 };
  const m = [
    1, 0, 0, 0, // column 0
    0, 1, 0, 0, // column 1
    0, 0, 1, 0, // column 2
    0.5, -0.5, 2, 1, // column 3 (translation / w)
  ];

  const result = projectClip(point, m);

  assert.deepEqual(result, {
    clipX: 1.5,
    clipY: 1.5,
    clipZ: 5,
    clipW: 1,
  });
});

test("extractTrackTuples flattens line and multiline GeoJSON", () => {
  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [1, 2, 3],
            [4, 5], // missing alt defaults to 0
          ],
        },
        properties: {},
      },
      {
        type: "Feature",
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [[6, 7, 8]],
            [[9, 10]],
          ],
        },
        properties: {},
      },
    ],
  };

  const tuples = extractTrackTuples(geojson);

  assert.deepEqual(tuples, [
    [1, 2, 3],
    [4, 5, 0],
    [6, 7, 8],
    [9, 10, 0],
  ]);
});

test("extractTrackTuples rejects unsupported geometry types", () => {
  const unsupported = { type: "Point", coordinates: [0, 0] };
  assert.throws(
    () => extractTrackTuples(unsupported),
    /Unsupported GeoJSON/,
  );
});

test("toWorldPoints delegates to MercatorCoordinate.fromLngLat", () => {
  const calls = [];
  const stubMapbox = {
    MercatorCoordinate: {
      fromLngLat: (lngLat, alt) => {
        calls.push({ lngLat, alt });
        return { lngLat, alt };
      },
    },
  };

  const tuples = [
    [1, 2],
    [3, 4, 5],
  ];

  const points = toWorldPoints(stubMapbox, tuples);

  assert.deepEqual(points, [
    { lngLat: [1, 2], alt: 0 },
    { lngLat: [3, 4], alt: 5 },
  ]);
  assert.deepEqual(calls, [
    { lngLat: [1, 2], alt: 0 },
    { lngLat: [3, 4], alt: 5 },
  ]);
});

test("createDroneLayer renders contiguous clipped runs only", () => {
  const prevWindow = globalThis.window;
  globalThis.window = {
    mapboxgl: {
      MercatorCoordinate: {
        fromLngLat: ([lng, lat], alt = 0) => ({ x: lng, y: lat, z: alt }),
      },
    },
  };

  try {
    const { gl, calls } = createStubGl();
    const layer = createDroneLayer({ depthBias: 0, clipTolerance: 2 });
    const track = {
      type: "LineString",
      coordinates: [
        [0, 0, 0], // inside clip window
        [3, 0, 0], // outside clip window -> breaks run
        [0, 0, 0], // restart
        [0.5, 0, 0], // contiguous inside
      ],
    };

    layer.setTrack(track);
    layer.onAdd({}, gl);
    const identityMatrix = [
      1, 0, 0, 0, //
      0, 1, 0, 0, //
      0, 0, 1, 0, //
      0, 0, 0, 1, //
    ];
    layer.render(gl, identityMatrix);

    const bufferCalls = calls.filter((c) => c.type === "bufferData");
    assert.equal(bufferCalls.length, 1);

    const [, data] = bufferCalls[0].args;
    assert.equal(data.length, 6); // two vertices, x/y/z each
    assert.deepEqual(Array.from(data), [0, 0, 0, 0.5, 0, 0]);

    const drawCalls = calls.filter((c) => c.type === "drawArrays");
    assert.equal(drawCalls.length, 1);
    assert.deepEqual(drawCalls[0].args, [gl.LINE_STRIP, 0, 2]);
  } finally {
    globalThis.window = prevWindow;
  }
});

function createStubGl() {
  const calls = [];
  const gl = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    ARRAY_BUFFER: 34962,
    DEPTH_TEST: 2929,
    BLEND: 3042,
    SRC_ALPHA: 770,
    ONE_MINUS_SRC_ALPHA: 771,
    LINE_STRIP: 3,
    FLOAT: 5126,
    DYNAMIC_DRAW: 35048,
    createShader: (type) => ({ type }),
    shaderSource() {},
    compileShader() {},
    getShaderParameter: () => true,
    getShaderInfoLog: () => "",
    createProgram: () => ({}),
    attachShader() {},
    linkProgram() {},
    getProgramParameter: () => true,
    getProgramInfoLog: () => "",
    getAttribLocation: () => 0,
    createVertexArray: () => ({}),
    createBuffer: () => ({}),
    bindVertexArray() {},
    bindBuffer() {},
    enableVertexAttribArray() {},
    vertexAttribPointer() {},
    useProgram() {},
    enable() {},
    depthMask() {},
    blendFunc() {},
    bufferData: (...args) => calls.push({ type: "bufferData", args }),
    drawArrays: (...args) => calls.push({ type: "drawArrays", args }),
  };

  return { gl, calls };
}
