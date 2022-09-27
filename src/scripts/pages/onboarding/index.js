import React from "react";
import styles from "./onboarding.module";

const Prompt = ({ title, children }) => {
  return (
    <div className={styles.prompt}>
      <div className={styles.title}>{title}</div>
      <div className={styles.contents}>{children}</div>
    </div>
  );
};

const Onboarding = () => {
  return (
    <div className={styles.onboardingPage}>
      <Prompt title="Hello world">
        <p>Hello world</p>
        <form className={styles.form}>
          <input name="email" type="email" placeholder="user@email.com"></input>
        </form>
      </Prompt>
    </div>
  );
};

export default Onboarding;
