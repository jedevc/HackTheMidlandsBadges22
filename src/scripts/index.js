let program = `
for i=0,63 do
  for j=0,35 do
    x = i / j
    image[i][j] = hsl(x-math.floor(x), 50, 50)
  end
end
`;

window.onload = () => {
  let canvas = document.querySelector("#image");
  let ctx = canvas.getContext("2d");
  let image = ctx.createImageData(canvas.width, canvas.height);

  let title = document.querySelector("#title");
  let content = document.querySelector("#content");

  createBadgeModule().then((Module) => {
    const i = setInterval(() => {
      let lua = new Module.Lua();
      try {
        console.log("loop");

        let result;
        result = lua.run(program);
        if (result.err) {
          throw new Error(result.err);
        }

        title.innerText = result.title;
        content.innerText = result.content;

        for (let i = 0; i < 64; i++) {
          for (let j = 0; j < 36; j++) {
            let pixel = result.pixel(i, j)
            let image_idx = 4 * (i + j * canvas.width);
            image.data[image_idx + 0] = (pixel >> 16) & 0xff;
            image.data[image_idx + 1] = (pixel >> 8) & 0xff;
            image.data[image_idx + 2] = pixel & 0xff;
            image.data[image_idx + 3] = 255;
          }
        }
        ctx.putImageData(image, 0, 0);

        lua.delete();
        result.delete();
      } catch (err) {
        console.error(err);
        clearInterval(i);
        return;
      }
    }, 100);
  });
};
