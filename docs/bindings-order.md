# Bindings Order

This is the typical order for setting up vertex input in WebGL2. The key point: the `ELEMENT_ARRAY_BUFFER` binding is stored in the VAO, so create/bind it while the VAO is bound.

## 1. Create and bind VAO

```js
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
```

## 2. Create and fill VBO

```js
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
```

## 3. Define vertex attributes (stride/offset)

```js
gl.enableVertexAttribArray(0); // position
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);

gl.enableVertexAttribArray(1); // color
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 2 * 4);
```

## 4. Create and bind EBO (with VAO bound)

```js
const ebo = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
```

## 5. Cleanup

```js
gl.bindVertexArray(null);
gl.bindBuffer(gl.ARRAY_BUFFER, null);
// Do not unbind ELEMENT_ARRAY_BUFFER here — it is part of the VAO state
```
