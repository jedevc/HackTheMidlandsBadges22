import React, { useCallback, useState, useEffect } from "react";

import createBadgeModule from "../../../../tmp/badge.emscripten.js";
import "../../../../tmp/badge.emscripten.wasm";

import styles from "./badge.module";

import badge from "./badge";
import loop from "./loop";

let badgeModule = null;

const Badge = ({ program }) => {
  const [cancel, setCancel] = useState(null);
  const [el, setEl] = useState(null);

  useEffect(() => {
    if (el === undefined || el === null) return;

    const setup = () => {
      let b = new badge(badgeModule, program, [
        {
          type: "text",
          name: "title",
          el: el.querySelector("." + styles.title),
        },
        {
          type: "text",
          name: "content",
          el: el.querySelector("." + styles.content),
        },
        {
          type: "image",
          name: "image",
          el: el.querySelector("." + styles.image),
        },
        {
          type: "error",
          name: "error",
          el: el.querySelector("." + styles.error),
        },
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
    <div className={styles.badgeContainer}>
      <div className={styles.badge} ref={setupRef}>
        <div className={styles.imageContainer}>
          <canvas className={styles.image} width="64" height="40"></canvas>
        </div>
        <span className={styles.title}></span>
        <span className={styles.content}></span>
        <span className={styles.citation}>HackTheMidlands 7.0</span>
        <span className={styles.error}></span>
      </div>
    </div>
  );
};

export default Badge;
