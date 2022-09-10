import React from "react";

import Badge from "./badge";

const defaultProgram = `
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

const View = () => {
  return (
    <Badge program={defaultProgram} />
  );
};

export default View;
