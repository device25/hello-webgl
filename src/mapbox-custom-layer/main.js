await import("https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js");
import { createDroneLayer } from "./drone-layer.js";
import { track } from "./track.js";

window.mapboxgl.accessToken =
  "pk.eyJ1IjoiZGV2aWNlMjUiLCJhIjoiY2lzaGN3d2tiMDAxOTJ6bGYydDZrcHptdiJ9.UK55aUzBquqYns1AdnuTQg";

const map = new window.mapboxgl.Map({
  container: "map",
  zoom: 14,
  center: [8.71256, 46.94753],
  pitch: 30,
  style: "mapbox://styles/mapbox/standard-satellite",
  antialias: true,
  projection: "mercator",
});

const droneLayer = createDroneLayer();

map.on("style.load", () => {
  map.addSource("mapbox-dem", {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });

  map.setTerrain({ source: "mapbox-dem", exaggeration: 1 });

  map.addLayer(droneLayer);
  droneLayer.setTrack(track);
});
