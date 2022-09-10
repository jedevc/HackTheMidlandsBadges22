import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import View from "./view";
import Editor from "./editor";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<View />} />
        <Route path="/dev" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
