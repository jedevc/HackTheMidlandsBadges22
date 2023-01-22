import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import View from "./pages/view";
import Editor from "./pages/editor";
import Demo from "./pages/demo";
import { APIError, NotFoundError } from "./pages/error";
import { Home } from "./pages/home";

const App = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact children={<Home />} />
      <Route path="/view/:id" children={<View editable={true} />} />
      <Route path="/dev/:id" children={<Editor editable={false} />} />
      <Route path="/demo" children={<Demo editable={false} />} />
      <Route path="/error" children={<APIError />} />
      <Route path="*" children={<NotFoundError />} />
    </BrowserRouter>
  );
};

export default App;
