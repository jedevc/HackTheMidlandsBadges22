import React, { useState } from "react";

import Badge from "./badge";
import Editor from "@monaco-editor/react";

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

const App = () => {
  let [program, setProgram] = useState(defaultProgram);
  const handleChange = (value) => {
    setProgram(value);
  }

  return (
    <div className="editor">
      <div className="editor-pane">
        <Editor
          value={program}
          language="lua"
          onChange={handleChange}
        />
      </div>
      <div className="badge-pane">
        <Badge program={program} />
      </div>
    </div>
  );
};

export default App;
