import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";

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
