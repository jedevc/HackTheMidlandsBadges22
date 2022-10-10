import React, { useState } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import styles from "./onboarding.module";

const Prompt = ({ title, children }) => {
  return (
    <div className={styles.prompt}>
      <div className={styles.title}>{title}</div>
      <div className={styles.contents}>{children}</div>
    </div>
  );
};

export const SignUpPrompt = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: this logic needs to be a mini server
    // create user
    // generate api key (associated with the badge)
    // send api key in email to user

    navigate("email");
  };

  return (
    <Prompt title="Sign Up">
      <p>Welcome to the HackTheMidlands Badge Editor! 🎉🎉</p>
      <p>
        To edit the contents of your badge, you'll need to sign up with your
        name and email address. We'll use your name to automatically populate
        the contents of your badge, but we'll keep your email address private,
        and only use it to send a confirmation email.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="name">Your name</label>
        <input
          name="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={handleChange(setName)}
        ></input>
        <label htmlFor="email">Your email address</label>
        <input
          name="email"
          type="email"
          placeholder="johndoe@email.com"
          value={email}
          onChange={handleChange(setEmail)}
        ></input>
        <input type="submit" value="Sign Up"></input>
      </form>
    </Prompt>
  );
};

export const EmailPrompt = () => {
  const [key, setKey] = useState("");
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // check the api key is valid
  };

  return (
    <Prompt title="Sign Up | Email Confirmation">
      <p>
        You should have received an email confirmation to your chosen email
        address!
      </p>
      <p>
        Please enter the api key from the email below to finish setting up your
        badge.
      </p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="name">Your key</label>
        <input
          name="name"
          type="password"
          placeholder="API Key"
          value={key}
          onChange={handleChange(setKey)}
        ></input>
        <input type="submit" value="Confirm"></input>
      </form>
    </Prompt>
  );
};

export const Onboarding = () => {
  return (
    <div className={styles.onboardingPage}>
      <Outlet />
    </div>
  );
};
