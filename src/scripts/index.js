let program = `
k = ((k or 0) + 1) % 64
for i=0,63 do
  for j=0,35 do
    x = i / j * k
    image[i][j] = hsl(x-math.floor(x), 50, 50)
  end
end
`;

class Badge {
  constructor(lua, titleEl, contentEl, canvasEl) {
    this.lua = lua;

    this.title = titleEl
    this.content = contentEl

    this.canvas = canvasEl
    this.ctx = this.canvas.getContext("2d");
    this.buffer = this.ctx.createImageData(this.canvas.width, this.canvas.height);
  }
  
  step() {
      let result = this.lua.run(program);
      if (result.err) {
        throw new Error(result.err);
      }

      title.innerText = result.title;
      content.innerText = result.content;

      for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 36; j++) {
          let pixel = result.pixel(i, j)
          let idx = 4 * (i + j * this.canvas.width);
          this.buffer.data[idx + 0] = (pixel >> 16) & 0xff;
          this.buffer.data[idx + 1] = (pixel >> 8) & 0xff;
          this.buffer.data[idx + 2] = pixel & 0xff;
          this.buffer.data[idx + 3] = 255;
        }
      }
      this.ctx.putImageData(this.buffer, 0, 0);
      result.delete();
  }
}

window.onload = () => {
  const fps = 100;
  const delta = 1000.0 / fps;

  createBadgeModule().then((Module) => {
    let lua = new Module.Lua();
    let title = document.querySelector("#title");
    let content = document.querySelector("#content");
    let canvas = document.querySelector("#image");
    let badge = new Badge(lua, title, content, canvas);

    let start, last;
    const step = (current) => {
      if (start === undefined) {
        start = current;
      }
      if (last === undefined) {
        last = current;
      }

      if (current - last > delta) {
        console.log("loop");
        try {
          badge.step()
        } catch (err) {
          console.error(err);
          return;
        }

        last = current;
      } else {
        console.log("skip");
      }
  
      window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  });
};
