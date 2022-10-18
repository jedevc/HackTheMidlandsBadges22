import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

import styles from "./button.module";

const Button = ({ text, icon, color, link = null, onClick = null }) => {
  const [pending, setPending] = useState(false);
  const handleClick = (...args) => {
    if (!onClick) return;
    let result = Promise.resolve(onClick(...args));
    setPending(true);
    result.then(() => setPending(false)).catch(() => setPending(false));
  };

  const content = (
    <>
      <span className={styles.buttonIcon}>
        {pending ? <FaSpinner className={styles.buttonSpinner} /> : icon}
      </span>
      <span className={styles.buttonText}>{text}</span>
    </>
  );
  const style = { backgroundColor: color };

  if (link === null) {
    return (
      <button className={styles.button} style={style} onClick={handleClick}>
        {content}
      </button>
    );
  } else if (link[0] == "/") {
    return (
      <Link
        to={link}
        className={styles.button}
        style={style}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  } else {
    return (
      <a
        href={link}
        className={styles.button}
        style={style}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }
};

export default Button;
