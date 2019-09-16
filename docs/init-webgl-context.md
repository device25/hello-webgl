```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Hello WebGL</title>
  </head>
  <body>
    <canvas id="canvas"></canvas>
    <script src="main.js"></script>
  </body>
</html>
```

```js
// main.js
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
```
