import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";
import { Onboarding, EmailPrompt, SignUpPrompt } from "./pages/onboarding";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/view/:id" element={<View />} />
        <Route path="/dev/:id" element={<Editor />} />
        <Route path="/onboarding" element={<Onboarding />}>
          <Route index element={<SignUpPrompt />} />
          <Route path="email" element={<EmailPrompt />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
