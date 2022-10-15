import React from "react";
import { Link } from "react-router-dom";

import styles from "./button.module";

const Button = ({ text, icon, color, link = null, onClick = null }) => {
  let content = (
    <>
      <span className={styles.buttonIcon}>{icon}</span> {text}
    </>
  );
  let style = { backgroundColor: color };

  if (link === null) {
    return (
      <button className={styles.button} style={style} onClick={onClick}>
        {content}
      </button>
    );
  } else if (link[0] == "/") {
    return (
      <Link to={link} className={styles.button} style={style} onClick={onClick}>
        {content}
      </Link>
    );
  } else {
    return (
      <a href={link} className={styles.button} style={style} onClick={onClick}>
        {content}
      </a>
    );
  }
};

export default Button;
