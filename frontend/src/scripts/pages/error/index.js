import React from "react";
import { Link, useLocation } from "react-router-dom";
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

export const NotFoundError = () => {
  const location = useLocation();
  return (
    <Error title="404 | Page Not Found">
      <p>
        The page you're looking for at <code>{location.pathname}</code> does not
        exist.
      </p>
      <p>
        <Link to="/">Click here to go back to the home page.</Link>
      </p>
    </Error>
  );
};

export const APIError = () => {
  const location = useLocation();
  const err = location.state?.error;

  const content = (
    <>
      <p>{err.message}</p>
      <p>
        <Link to="/">Click here to go back to the home page.</Link>
      </p>
    </>
  );
  if (err.httpCode && err.httpMessage) {
    return (
      <Error title={`${err.httpCode} | ${err.httpMessage}`}>{content}</Error>
    );
  } else {
    return <Error title={err.message}>{content}</Error>;
  }
};
