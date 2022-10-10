import React, { useState } from "react";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import styles from "./onboarding.module";

import useLocalStorage from "../../../hooks/useLocalStorage";

const Prompt = ({ title, error, children }) => {
  return (
    <div className={styles.prompt}>
      <div className={styles.title}>{title}</div>
      <div className={styles.contents}>
        {children}
        <div className={styles.error}>
          {error && <p className={styles.error}>{error.toString()}</p>}
        </div>
      </div>
    </div>
  );
};

export const SignUpPrompt = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const req = new Request(process.env.PLATFORM_SERVER_URL + "/signup", {
      method: "POST",
      body: JSON.stringify({ name, email }),
      headers: new Headers({
        "Content-Type": "application/json",
      }),
    });
    fetch(req)
      .then((res) => ({ res, body: res.json() }))
      .then(({ res, body }) => {
        if (!res.ok) {
          if (body.error) {
            throw new Error(body.error);
          }
          throw new Error(res.statusText);
        }
        return body;
      })
      .then((body) => {
        console.log(body);
        navigate("email");
      })
      .catch(setError);
  };

  return (
    <Prompt title="Sign Up" error={error}>
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
          required
          placeholder="John Doe"
          value={name}
          onChange={handleChange(setName)}
        ></input>
        <label htmlFor="email">Your email address</label>
        <input
          name="email"
          type="email"
          required
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
  const navigate = useNavigate();
  const [storedKey, setStoredKey] = useLocalStorage("token", undefined);

  const [key, setKey] = useState("");
  const [error, setError] = useState(null);
  const handleChange = (setter) => (e) => {
    setter(e.target.value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const req = new Request(process.env.PLATFORM_SERVER_URL + "/permissions", {
      headers: new Headers({
        "X-Token": key,
      }),
    });
    fetch(req)
      .then((res) => ({ res, body: res.json() }))
      .then(({ res, body }) => {
        if (!res.ok) {
          if (body.error) {
            throw new Error(body.error);
          }
          throw new Error(res.statusText);
        }
        return body;
      })
      .then((body) => {
        // FIXME: check if token has permissions to write that badge
        setStoredKey(key);
        navigate("/dev/test");
      })
      .catch(setError);
  };

  return (
    <Prompt title="Sign Up | Email Confirmation" error={error}>
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
