import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./onboarding.module";
import { api } from "../../api";

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

const handleChange = (setter) => (e) => {
  setter(e.target.value);
};

export const BadgePrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badge = location.state?.badge;
  if (badge) {
    useEffect(() => {
      navigate("create", { state: { badge } });
    });
    return <></>;
  }

  const [badgeCode, setBadgeCode] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();

    api({ path: `badges/${badgeCode}`, token: "master" })
      .then((badge) => {
        if (badge.claimed) {
          navigate("confirm", { state: { badge } });
        } else {
          navigate("create", { state: { badge } });
        }
      })
      .catch(setError);
  };

  return (
    <Prompt title="Sign Up" error={error}>
      <p>Welcome to the HackTheMidlands Badge Editor! 🎉</p>
      <p>To continue, please enter the code that appears on your badge.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="badge-code">Badge code</label>
        <input
          name="badge-code"
          type="text"
          required
          value={badgeCode}
          onChange={handleChange(setBadgeCode)}
        ></input>
        <input type="submit" value="Connect Badge"></input>
      </form>
    </Prompt>
  );
};

export const UserPrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badge = location.state?.badge;
  if (!badge) {
    useEffect(() => {
      navigate("../");
    });
    return <></>;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();

    api({
      path: "signup",
      method: "POST",
      body: { name, email, badge: badge.id },
    })
      .then((user) => {
        navigate("../confirm", { state: { user, badge } });
      })
      .catch(setError);
  };

  return (
    <Prompt title="Sign Up | Create user" error={error}>
      <p>Welcome to the HackTheMidlands Badge Editor! 🎉</p>
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

export const ConfirmationPrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const badge = location.state?.badge;
  const user = location.state?.user;
  if (!badge) {
    useEffect(() => {
      navigate("../");
    });
    return <></>;
  }

  const [storedKey, setStoredKey] = useLocalStorage("token", undefined);

  const [key, setKey] = useState("");
  const [error, setError] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();

    api({ path: "permissions", token: key })
      .then((permissions) => {
        if (!permissions.store.badges.write.includes(badge.id)) {
          throw new Error("Provided token cannot connect to target badge");
        }
        if (!permissions.store.keys.read.includes("code")) {
          throw new Error("Provided token cannot read code");
        }
        if (!permissions.store.keys.write.includes("code")) {
          throw new Error("Provided token cannot write code");
        }
        setStoredKey(key);
        navigate("/dev/" + badge.id);
      })
      .catch(setError);
  };

  return (
    <Prompt title="Sign Up | Email Confirmation" error={error}>
      {user ? (
        <>
          <p>
            You should have received an email confirmation to your chosen email
            address!
          </p>
          <p>
            Enter the api key from the email to finish setting up your badge.
          </p>
        </>
      ) : (
        <>
          <p>
            This badge has already been claimed - if you were the one to claim
            it, then enter the code you received in your email.
          </p>
        </>
      )}
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
