import React, { useCallback, useState, useEffect } from "react";

import createBadgeModule from "../../../../tmp/badge.emscripten.js";
import badgeWasm from "../../../../tmp/badge.emscripten.wasm";

import styles from "./badge.module";
import BadgeOutline from "../../../assets/badge-outline.svg";
import BadgeBackground from "../../../assets/badge-background.svg";
import BadgeClip from "../../../assets/badge-clip.svg";

import badge from "./badge";
import loop from "./loop";

let badgeModule = null;

const Badge = ({ program, onError = null }) => {
  const [badgeEl, setBadgeEl] = useState(null);
  const [controlEl, setControlEl] = useState(null);

  useEffect(() => {
    if (
      badgeEl === undefined ||
      badgeEl === null ||
      controlEl === undefined ||
      controlEl === null
    )
      return;

    let globals = {
      control_x: 0,
      control_y: 0,
      control_r: 0,
      control_theta: 0,
    };

    const setup = () => {
      let b = new badge(
        badgeModule,
        program,
        [
          {
            type: "text",
            name: "title",
            el: badgeEl.querySelector("." + styles.title),
          },
          {
            type: "text",
            name: "content",
            el: badgeEl.querySelector("." + styles.content),
          },
          {
            type: "image",
            name: "image",
            el: badgeEl.querySelector("." + styles.image),
          },
        ],
        (onError = onError)
      );
      const loopCancel = loop(() => {
        for (const [k, v] of Object.entries(globals)) {
          b.set(k, v);
        }
        b.step();
      });

      const getEventXY = (e) => {
        let targetX, targetY;
        if (e.touches) {
          targetX = e.touches[0].screenX;
          targetY = e.touches[0].screenY;
        } else {
          targetX = e.clientX;
          targetY = e.clientY;
        }
        return [targetX, targetY];
      };

      let down = null;
      const mouseDown = (e) => {
        let [x, y] = getEventXY(e);
        down = { x, y };
      };
      controlEl.addEventListener("mousedown", mouseDown);
      window.addEventListener("touchstart", mouseDown);
      const mouseUp = () => {
        down = null;
        globals.control_x = 0;
        globals.control_y = 0;
        controlEl.style.transform = "";
      };
      window.addEventListener("mouseup", mouseUp);
      window.addEventListener("touchend", mouseUp);
      const mouseMove = (e) => {
        if (!down) return;
        let [targetX, targetY] = getEventXY(e);
        let dx = targetX - down.x;
        let dy = targetY - down.y;
        let dz = Math.sqrt(dx * dx + dy * dy);
        let mz = controlEl.getBoundingClientRect().width;
        if (dz > mz) {
          dx /= dz / mz;
          dy /= dz / mz;
        }
        controlEl.style.transform = `translate(${dx}px, ${dy}px)`;
        globals = {
          control_x: dx / mz,
          control_y: dy / mz,
          control_r: dz / mz,
          control_theta:
            (360 * (Math.atan2(dy, dx) / (2 * Math.PI)) + 360 + 90) % 360,
        };
      };
      window.addEventListener("mousemove", mouseMove);
      window.addEventListener("touchmove", mouseMove);

      return () => {
        controlEl.removeEventListener("mousedown", mouseDown);
        controlEl.removeEventListener("touchstart", mouseDown);
        window.removeEventListener("mouseup", mouseUp);
        window.removeEventListener("touchend", mouseUp);
        window.removeEventListener("mousemove", mouseMove);
        window.removeEventListener("touchmove", mouseMove);
        loopCancel();
        b.delete();
      };
    };

    let cancel;
    if (badgeModule === null) {
      const settings = {
        locateFile: (path, prefix) => {
          if (path.endsWith("badge.emscripten.wasm")) {
            return badgeWasm;
          }
          return prefix + path;
        },
      };
      cancel = createBadgeModule(settings).then((Module) => {
        badgeModule = Module;
        return setup();
      });
    } else {
      cancel = Promise.resolve(setup());
    }
    return () => {
      cancel.then((cancel) => cancel());
    };
  }, [program, badgeEl, controlEl]);

  const contentsRef = useCallback((el) => {
    setBadgeEl(el);
  });
  const controllerRef = useCallback((el) => {
    setControlEl(el);
  });
  return (
    <div className={styles.badgeContainer}>
      <div className={styles.badgeBounds}>
        <div className={styles.badge}>
          <BadgeBackground className={styles.badgeBackground} />
          <BadgeOutline className={styles.badgeOutline} />
          <BadgeClip />
          <div className={styles.badgeContents} ref={contentsRef}>
            <div className={styles.imageContainer}>
              <canvas className={styles.image} width="64" height="48"></canvas>
            </div>
            <div className={styles.container}>
              <span className={styles.title}></span>
              <span className={styles.content}></span>
            </div>
            <div className={styles.controllerBounds}>
              <div className={styles.controller} ref={controllerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badge;
