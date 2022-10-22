import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";
import {
  Onboarding,
  UserPrompt,
  BadgePrompt,
  ConfirmationPrompt,
} from "./pages/onboarding";
import { NotFound } from "./pages/error";
import { Home } from "./pages/home";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view/:id" element={<View />} />
        <Route path="/dev/:id" element={<Editor />} />
        <Route path="/onboarding" element={<Onboarding />}>
          <Route index element={<BadgePrompt />} />
          <Route path="create" element={<UserPrompt />} />
          <Route path="confirm" element={<ConfirmationPrompt />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
