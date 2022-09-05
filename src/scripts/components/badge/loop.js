export default function loop(cb, fps = 60) {
  const delta = 1000.0 / fps;

  let start, last;
  let lagCount = 0;

  const step = (current) => {
    if (start === undefined) start = current;
    if (last === undefined) last = current;
    const diff = current - last;

    // detect and report lag
    if (lagCount !== null) {
      if (diff > delta * 1.2) {
        lagCount++;
        if (lagCount > 100) {
          const fpsActual = (1000 / diff).toFixed(2);
          console.warn(
            `lag detected! fps target is ${fps} but getting ${fpsActual}`
          );
          lagCount = null;
        }
      } else {
        lagCount = 0;
      }
    }

    if (diff > delta) {
      try {
        cb();
      } catch (err) {
        console.error(err);
        return;
      }
      last = current;
    }

    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}
