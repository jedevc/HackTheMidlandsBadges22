import Badge from "./badge";
import loop from "./loop";

let program = `
title = "John Doe"
content = "Hello I am John Doe!"
k = (k or 0) + 1
for i=1,image_width do
  for j=1,image_height do
    x = (i + j + k) % 100
    image[i][j] = hsl(x / 100, 0.7, 0.5)
  end
end
`;

window.addEventListener("DOMContentLoaded", () => {
  createBadgeModule().then((Module) => {
    let badge = new Badge(Module, program, document, [
      { type: "text", name: "title" },
      { type: "text", name: "content" },
      { type: "image", name: "image" },
    ]);
    loop(() => badge.step());
  });
});
