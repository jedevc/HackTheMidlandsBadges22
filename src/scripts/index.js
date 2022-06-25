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

    this.title = titleEl;
    this.content = contentEl;

    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext("2d");
    this.buffer = this.ctx.createImageData(
      this.canvas.width,
      this.canvas.height
    );
  }

  step() {
    let result = this.lua.run();
    if (result.err) {
      throw new Error(result.err);
    }

    title.innerText = result.title;
    content.innerText = result.content;

    for (let i = 0; i < 64; i++) {
      for (let j = 0; j < 36; j++) {
        let pixel = result.pixel(i, j);
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
  createBadgeModule().then((Module) => {
    let lua = new Module.Lua(program);
    let title = document.querySelector("#title");
    let content = document.querySelector("#content");
    let canvas = document.querySelector("#image");
    let badge = new Badge(lua, title, content, canvas);

    const fps = 60;
    const delta = 1000.0 / fps;

    let start, last;
    let lagCount = 0;

    const step = (current) => {
      if (start === undefined) start = current;
      if (last === undefined) last = current;
      const diff = current - last;

      // detect and report lag
      if (lagCount !== null) {
        if (diff > delta * 1.2) {
          lagCount++;
          if (lagCount > 100) {
            console.warn(
              `lag detected! fps target is ${fps} but getting ${(
                1000 / diff
              ).toFixed(2)}`
            );
            lagCount = null;
          }
        } else {
          lagCount = 0;
        }
      }

      if (diff > delta) {
        try {
          badge.step();
        } catch (err) {
          console.error(err);
          return;
        }
        last = current;
      }

      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  });
};
