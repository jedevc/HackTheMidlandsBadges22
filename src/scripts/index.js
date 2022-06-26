let program = `
title = "Title!"
content = "Content!"
k = ((k or 0) + 1) % 64
for i=0,63 do
  for j=0,35 do
    x = i / j * k
    image[i][j] = hsl(x-math.floor(x), 50, 50)
  end
end
`;

class Badge {
  constructor(module, program, rootEl, props) {
    this.lua = new module.Lua(program);

    this.texts = {};
    this.images = {};

    for (let prop of props) {
      let el = rootEl.getElementById(prop.name);
      if (el === undefined) {
        throw new Error(`could not find ${prop.name} in ${rootEl}`);
      }

      switch (prop.type) {
        case "text":
          this.texts[prop.name] = el;
          this.lua.export_text(prop.name);
          break;
        case "image":
          let ctx = el.getContext("2d");
          let buffer = ctx.createImageData(el.width, el.height);
          this.images[prop.name] = [el, ctx, buffer];
          this.lua.export_image(prop.name, el.width, el.height);
          break;
        default:
          throw new Error(`unknown property type ${prop.type}`);
      }
    }
  }

  step() {
    let result = this.lua.run();
    if (result.err) {
      throw new Error(result.err);
    }

    for (const [name, el] of Object.entries(this.texts)) {
      el.innerText = result.pop_text(name);
    }

    for (const [name, [el, ctx, buffer]] of Object.entries(this.images)) {
      let img = result.pop_image(name);
      for (let i = 0; i < img.width; i++) {
        for (let j = 0; j < img.height; j++) {
          let pixel = img.pixel(i, j);
          let idx = 4 * (i + j * img.width);
          buffer.data[idx + 0] = (pixel >> 16) & 0xff;
          buffer.data[idx + 1] = (pixel >> 8) & 0xff;
          buffer.data[idx + 2] = pixel & 0xff;
          buffer.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(buffer, 0, 0);
      img.delete();
    }

    result.delete();
  }
}

window.onload = () => {
  createBadgeModule().then((Module) => {
    let badge = new Badge(Module, program, document, [
      { type: "text", name: "title" },
      { type: "text", name: "content" },
      { type: "image", name: "image" },
    ]);

    const fps = 120;
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
            const fpsActual = (1000 / diff).toFixed(2);
            console.warn(
              `lag detected! fps target is ${fps} but getting ${fpsActual}`
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
