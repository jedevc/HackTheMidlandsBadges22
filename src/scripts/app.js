import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";
import Onboarding from "./pages/onboarding";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/:id" element={<View />} />
        <Route path="/dev/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
