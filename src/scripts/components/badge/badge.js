export default class Badge {
  constructor(module, program, rootEl, props) {
    this.lua = new module.Lua();

    this.texts = {};
    this.images = {};
    this.errors = {};

    for (let prop of props) {
      let el = rootEl.querySelector(prop.selector);
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
        case "error":
          this.errors[prop.name] = el;
          break;
        default:
          throw new Error(`unknown property type ${prop.type}`);
      }

      el.classList.add("ready");
    }

    let result = this.lua.parse(program);
    if (result.err) {
      this.setError(result.err);
      throw new Error(result.err);
    }
    result.delete();
  }

  step() {
    let result = this.lua.run();
    if (result.err) {
      this.setError(result.err);
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

  delete() {
    if (this.lua === null) return;
    this.lua.delete();
    this.lua = null;
  }

  setError(message) {
    for (let [name, el] of Object.entries(this.errors)) {
      console.log(el, message);
      el.innerText = message;
    }
  }
}
