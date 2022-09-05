import React, { useCallback } from "react";

import createBadgeModule from "../../../../tmp/badge.emscripten.js";
import "../../../../tmp/badge.emscripten.wasm";

import badge from "./badge";
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

const Badge = () => {
  const setupRef = useCallback((el) => {
    if (el === null) return;
    console.log(el);
    console.log(el.getElementByID);
    setup(program, el);
  });
  return (
    <div className="badge" ref={setupRef}>
      <div className="image-container">
        <canvas className="image" width="64" height="40"></canvas>
      </div>
      <span className="title"></span>
      <span className="content"></span>
      <span className="citation">HackTheMidlands 7.0</span>
    </div>
  );
};

export default Badge;

function setup(program, el) {
  createBadgeModule().then((Module) => {
    let b = new badge(Module, program, el, [
      { type: "text", name: "title", selector: ".title" },
      { type: "text", name: "content", selector: ".content" },
      { type: "image", name: "image", selector: ".image" },
    ]);
    loop(() => b.step());
  });
}
