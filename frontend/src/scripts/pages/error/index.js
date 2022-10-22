import React from "react";
import { useLocation } from "react-router-dom";
import styles from "./error.module";

export const Error = ({ title, children }) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.page}>
        <div className={styles.title}>{title}</div>
        <div className={styles.contents}>{children}</div>
      </div>
    </div>
  );
};

export const NotFound = () => {
  const location = useLocation();
  return (
    <Error title="404 | Page Not Found">
      <p>
        The page you're looking for at <code>{location.pathname}</code> does not
        exist.
      </p>
    </Error>
  );
};

export const APIError = ({ err }) => {
  return (
    <Error title={`${err.httpCode} | ${err.httpMessage}`}>
      <p>{err.message}</p>
    </Error>
  );
};
