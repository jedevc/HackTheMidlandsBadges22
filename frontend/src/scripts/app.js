import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";
import {
  Onboarding,
  UserPrompt,
  BadgePrompt,
  ConfirmationPrompt,
} from "./pages/onboarding";
import { APIError, NotFoundError } from "./pages/error";
import { Home } from "./pages/home";

const App = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact children={<Home />} />
      <Route path="/view/:id" children={<View />} />
      <Route path="/dev/:id" children={<Editor />} />
      <Route path="/onboarding">
        <Onboarding>
          <Route path="/onboarding" exact children={<BadgePrompt />} />
          <Route path="/onboarding/create" children={<UserPrompt />} />
          <Route path="/onboarding/confirm" children={<ConfirmationPrompt />} />
        </Onboarding>
      </Route>
      <Route path="/error" children={<APIError />} />
      <Route path="*" children={<NotFoundError />} />
    </BrowserRouter>
  );
};

export default App;
