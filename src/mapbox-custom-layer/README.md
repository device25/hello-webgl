# CPU-Projected Polyline for Mapbox Terrain  
Jitter-free and terrain-occluded custom Mapbox GL JS layer

This project implements a custom Mapbox GL JS layer that draws a 3D polyline **without jitter** and **with correct terrain occlusion** even when Mapbox Terrain (`raster-dem`) is enabled.

It uses CPU-side projection of Mercator world coordinates into NDC (normalized device space), supplying a stable `vec3` (x,y,z) directly to `gl_Position`.  
This avoids jitter caused by dynamic DEM tile loading, while still allowing the line to be naturally occluded by terrain through depth testing.

---

## Why this approach works

### Problem: jitter with `setTerrain()`
Mapbox dynamically refines terrain mesh and updates internal matrices as DEM tiles load.  
Any world-space geometry rendered through:

```glsl
gl_Position = u_matrix * vec4(worldPos, 1.0);
```

…inherits these small changes, causing visible jitter or vibration of lines.

### Solution: CPU-projection into screen space
Instead of passing world coordinates to the shader, the layer:

1. Multiplies each world-space point by the map’s view-projection matrix on the CPU  
2. Computes stable clip-space values  
3. Converts clip-space → NDC by dividing by W  
4. Passes `(x, y, z)` in **NDC** directly to the vertex shader  
5. Uses GPU depth testing so the polyline can disappear behind terrain  

Because the geometry is already fully projected, it is no longer influenced by DEM updates.

---

## Features

- ✔ **Zero jitter** with terrain  
- ✔ **Correct occlusion by terrain** using depth test  
- ✔ Uses track altitudes (`z`) from data  
- ✔ Full public API to load/update/clear tracks  
- ✔ Efficient CPU projection  
- ✔ Clip-safe segmentation of polyline  
- ✔ Works with any camera motion, zoom, pitch  
- ✔ Simple and lightweight WebGL2 pipeline  

---

## Limitations

- The polyline is rendered in **screen space**, not world space  
- Does not occlude buildings  
- Does not support true 3D thickness  
- Not suitable for 3D meshes requiring lighting  

---

## Public API

### `setTrack(geojson)`
Pass a GeoJSON LineString/MultiLineString/Feature/FeatureCollection.

### `loadTrack(url[, fetchOptions])`
Fetch and load a GeoJSON file.

### `clearTrack()`
Remove current track.

---

## How occlusion works

We compute:

```
clip = M * world
ndc = clip.xyz / clip.w
```

and send it as `vec3 a_pos` to the shader.  
Depth testing then naturally occludes line fragments behind terrain.

A small `depthBias` is added to reduce z-fighting.

---

## How clipping works

Near the camera or outside the frustum, clip-space values can diverge.  
We validate:

- `clipW > EPS`
- `|clipX| <= clipTolerance * clipW`
- `|clipY| <= clipTolerance * clipW`

Invalid points break the polyline into safe segments.

---

## Usage example

```js
import { createDroneLayer } from "./droneLayer.js";

const layer = createDroneLayer({
  color: [1, 0, 0, 1],
  depthBias: -1e-4,
  clipTolerance: 2.0,
});

map.on("style.load", async () => {
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

  map.addLayer(layer);

  await layer.loadTrack("/track.geojson");
});
```

---

## File structure

```
src/
├── droneLayer.js
├── projectClip.js
└── README.md
```

---

## Future enhancements

- Screen-space thick lines  
- Animated marker on path  
- Gradient coloring (speed/altitude)  
- Multi-track batching  
- Instanced rendering  

---

## License

This project follows Mapbox GL JS custom layer guidelines.
