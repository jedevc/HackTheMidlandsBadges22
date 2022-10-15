import React, { useCallback, useState, useEffect } from "react";

import createBadgeModule from "../../../../tmp/badge.emscripten.js";
import "../../../../tmp/badge.emscripten.wasm";

import styles from "./badge.module";
import BadgeOutline from "../../../assets/badge-outline.svg";
import BadgeBackground from "../../../assets/badge-background.svg";
import BadgeClip from "../../../assets/badge-clip.svg";

import badge from "./badge";
import loop from "./loop";

let badgeModule = null;

const Badge = ({ program, onError = null }) => {
  const [cancel, setCancel] = useState(null);
  const [el, setEl] = useState(null);

  useEffect(() => {
    if (el === undefined || el === null) return;

    const setup = () => {
      let b = new badge(
        badgeModule,
        program,
        [
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
        ],
        (onError = onError)
      );
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
      <div className={styles.badgeBounds}>
        <div className={styles.badge}>
          <BadgeBackground className={styles.badgeBackground} />
          <BadgeOutline className={styles.badgeOutline} />
          <BadgeClip />
          <div className={styles.badgeContents} ref={setupRef}>
            <div className={styles.imageContainer}>
              <canvas className={styles.image} width="64" height="48"></canvas>
            </div>
            <div className={styles.container}>
              <span className={styles.title}></span>
              <span className={styles.content}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge;
