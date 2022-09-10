import React, { useCallback, useState, useEffect } from "react";

import createBadgeModule from "../../../../tmp/badge.emscripten.js";
import "../../../../tmp/badge.emscripten.wasm";

import badge from "./badge";
import loop from "./loop";

let badgeModule = null;

const Badge = ({program}) => {
  const [cancel, setCancel] = useState(null);
  const [el, setEl] = useState(null);

  useEffect(() => {
    if (el === undefined || el === null) return;

    const setup = () => {
      let b = new badge(badgeModule, program, el, [
        { type: "text", name: "title", selector: ".title" },
        { type: "text", name: "content", selector: ".content" },
        { type: "image", name: "image", selector: ".image" },
      ]);
      const loopCancel = loop(() => b.step());
      setCancel(() => () => {
        loopCancel();
        b.delete();
      });
    };
    if (badgeModule === null) {
      createBadgeModule().then((Module) => {
        badgeModule = Module;
        setup();
      });
    } else {
      setup();
    }

    return () => {
      if (cancel !== null) {
        cancel();
      }
    };
  }, [program, el]);

  const setupRef = useCallback((el) => {
    setEl(el);
  });
  return (
    <div className="badge-container">
      <div className="badge" ref={setupRef}>
        <div className="image-container">
          <canvas className="image" width="64" height="40"></canvas>
        </div>
        <span className="title"></span>
        <span className="content"></span>
        <span className="citation">HackTheMidlands 7.0</span>
      </div>
    </div>
  );
};

export default Badge;
