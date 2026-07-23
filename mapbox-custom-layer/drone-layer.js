/**
 * Extract [lng, lat, alt?] tuples from GeoJSON LineString/MultiLineString.
 */
export const extractTrackTuples = (geojson) => {
  const tuples = [];
  const pushLine = (coords) => {
    for (const c of coords) {
      const [lng, lat, alt = 0] = c;
      tuples.push([lng, lat, alt]);
    }
  };

  if (geojson.type === "FeatureCollection") {
    for (const f of geojson.features) {
      const g = f?.geometry;
      if (!g) continue;
      if (g.type === "LineString") pushLine(g.coordinates);
      if (g.type === "MultiLineString")
        for (const line of g.coordinates) pushLine(line);
    }
  } else if (geojson.type === "Feature") {
    const g = geojson.geometry;
    if (g?.type === "LineString") pushLine(g.coordinates);
    if (g?.type === "MultiLineString")
      for (const line of g.coordinates) pushLine(line);
  } else if (geojson.type === "LineString") {
    pushLine(geojson.coordinates);
  } else if (geojson.type === "MultiLineString") {
    for (const line of geojson.coordinates) pushLine(line);
  } else {
    throw new Error(
      "Unsupported GeoJSON: expected LineString or MultiLineString",
    );
  }

  return tuples;
};

/**
 * Convert [lng,lat,alt] tuples to MercatorCoordinate world points.
 */
export const toWorldPoints = (mapboxgl, tuples) => {
  return tuples.map(([lng, lat, alt = 0]) =>
    mapboxgl.MercatorCoordinate.fromLngLat([lng, lat], alt),
  );
};

/**
 * Project a world-space MercatorCoordinate into clip-space (before division by W).
 * Returns clipX/clipY/clipZ/clipW so caller can compute NDC and perform clipping.
 */
export const projectClip = (point, m) => {
  const { x, y, z } = point;

  const clipX = m[0] * x + m[4] * y + m[8] * z + m[12];
  const clipY = m[1] * x + m[5] * y + m[9] * z + m[13];
  const clipZ = m[2] * x + m[6] * y + m[10] * z + m[14];
  const clipW = m[3] * x + m[7] * y + m[11] * z + m[15];

  return { clipX, clipY, clipZ, clipW };
};

/**
 * Factory that returns a jitter-free custom layer with terrain occlusion.
 * Options:
 *   depthBias: small negative bias added to ndc.z to reduce z-fighting (e.g. -1e-4)
 *   clipTolerance: expands clip window (>1 reduces edge flicker)
 * @example
 * const droneLayer = createDroneLayer({ depthBias: -1e-4 });
 *
 * map.on('style.load', async () => {
 *  map.addSource('mapbox-dem', {
 *    type:'raster-dem',
 *    url:'mapbox://mapbox.mapbox-terrain-dem-v1',
 *    tileSize:512,
 *    maxzoom:14
 *  });
 *  map.setTerrain({ source:'mapbox-dem', exaggeration:1 });
 *  map.addLayer(droneLayer);
 *  droneLayer.setTrack(track);
 * });
 */
export const createDroneLayer = ({
  depthBias = -1e-4,
  clipTolerance = 2.0,
} = {}) => {
  let program = null;
  let aPos = -1;
  let vao = null;
  let vbo = null;

  // Current world points (MercatorCoordinate[]) provided via setTrack/loadTrack.
  let world = null;

  // Scratch buffer reused every frame (stores NDC xyz floats).
  let ndcScratch = null;

  const droneLayer = {
    id: "drone-layer",
    type: "custom",
    renderingMode: "3d",
    slot: "top",

    setTrack(geojson) {
      if (!window.mapboxgl) {
        throw new Error("mapboxgl not found in window");
      }

      const tuples = extractTrackTuples(geojson);
      world = toWorldPoints(window.mapboxgl, tuples);
      ndcScratch = new Float32Array(world.length * 3); // x,y,z per vertex
    },

    clearTrack() {
      world = null;
      ndcScratch = null;
    },

    // --- Mapbox custom layer hooks ---
    onAdd(map, gl) {
      // Pass-through shaders in NDC, but now with depth (vec3)
      const vs = `#version 300 es
        in vec3 a_pos; // NDC coords: x,y,z in [-1,1]   
        void main() {
          gl_Position = vec4(a_pos, 1.0);
        }
      `;
      const fs = `#version 300 es
        precision highp float;
        out vec4 outColor;

        void main() {
          outColor = vec4(1.0, 1.0, 0.0, 1.0);
        }
      `;

      // Build program
      const vert = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vert, vs);
      gl.compileShader(vert);

      if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
        throw new Error(
          "Vertex shader compile error: " + gl.getShaderInfoLog(vert),
        );
      }

      const frag = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(frag, fs);
      gl.compileShader(frag);

      if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
        throw new Error(
          "Fragment shader compile error: " + gl.getShaderInfoLog(frag),
        );
      }

      program = gl.createProgram();
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error("Program link error: " + gl.getProgramInfoLog(program));
      }

      aPos = gl.getAttribLocation(program, "a_pos");

      // VAO/VBO for vec3 positions
      vao = gl.createVertexArray();
      vbo = gl.createBuffer();

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    },

    render(gl, matrix) {
      if (!program || !vao || !vbo) return;
      if (!world || world.length < 2) return;

      gl.useProgram(program);

      const EPS = 1e-6; // near-plane guard
      const K = clipTolerance; // relaxed clip window

      // Ensure scratch capacity
      if (!ndcScratch || ndcScratch.length < world.length * 3) {
        ndcScratch = new Float32Array(world.length * 3);
      }

      // Segment into runs inside the clip window
      const runs = [];
      let runLen = 0; // floats in current run
      let cursor = 0; // write head for scratch reuse

      for (let i = 0; i < world.length; i++) {
        const { clipX, clipY, clipZ, clipW } = projectClip(world[i], matrix);
        const valid =
          clipW > EPS &&
          Math.abs(clipX) <= K * clipW &&
          Math.abs(clipY) <= K * clipW;

        if (valid) {
          const ndcX = clipX / clipW;
          const ndcY = clipY / clipW;
          const ndcZ = clipZ / clipW + depthBias; // bias towards camera to reduce z-fighting

          ndcScratch[cursor + runLen++] = ndcX;
          ndcScratch[cursor + runLen++] = ndcY;
          ndcScratch[cursor + runLen++] = ndcZ;
        } else {
          if (runLen >= 6) runs.push({ offset: cursor, length: runLen }); // at least 2 vertices (2*3)
          cursor += runLen;
          runLen = 0;
        }
      }
      if (runLen >= 6) runs.push({ offset: cursor, length: runLen });

      // Render with depth so terrain can occlude the line
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

      for (const { offset, length } of runs) {
        gl.bufferData(
          gl.ARRAY_BUFFER,
          ndcScratch.subarray(offset, offset + length),
          gl.DYNAMIC_DRAW,
        );
        gl.drawArrays(gl.LINE_STRIP, 0, length / 3);
      }

      gl.bindVertexArray(null);
    },
  };

  return droneLayer;
};
