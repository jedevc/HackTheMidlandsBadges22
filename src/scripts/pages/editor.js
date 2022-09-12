import React, { useState } from "react";

import Badge from "../components/badge";
import Monaco from "@monaco-editor/react";

import Button from "../components/button";
import { FaGlasses, FaSave } from "react-icons/fa";

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

const Editor = () => {
  let [program, setProgram] = useState(defaultProgram);
  const handleChange = (value) => {
    setProgram(value);
  };

  return (
    <div className="editor">
      <div className="toolbar-pane">
        <Button text="Save" icon={<FaSave />} color="#3b66fa" />
        <Button text="View" icon={<FaGlasses />} color="#ff7365" link="/" />
      </div>
      <div className="editor-pane">
        <Monaco value={program} language="lua" onChange={handleChange} />
      </div>
      <div className="badge-pane">
        <Badge program={program} />
      </div>
    </div>
  );
};

export default Editor;