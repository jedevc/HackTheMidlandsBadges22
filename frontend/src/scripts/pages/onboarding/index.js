import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./onboarding.module";
import { api } from "../../api";

const Prompt = ({ title, error, children }) => {
  return (
    <div className={styles.page}>
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
  const [badgeCode, setBadgeCode] = useState("");
  const [error, setError] = useState(null);

  const next = (code) => {
    return api({
      path: `badges/${code}`,
      token: process.env.PLATFORM_DEFAULT_TOKEN,
    }).then((badge) => {
      if (badge.claimed) {
        navigate("confirm", { state: { badge } });
      } else {
        navigate("create", { state: { badge } });
      }
    });
  };

  if (location.state?.badge) {
    useEffect(() => {
      next(location.state.badge.id).catch((error) =>
        navigate("/error", { state: { error } })
      );
    });
    return <></>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    next(badgeCode).catch(setError);
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

  return (
    <Prompt title="Sign Up | Email Confirmation">
      {user ? (
        <>
          <p>
            You should have received an email confirmation to your chosen email
            address!
          </p>
          <p>Click the link in the email to login.</p>
        </>
      ) : (
        <>
          <p>
            This badge has already been claimed - if you were the one to claim
            it, then click the link you've received in your email.
          </p>
        </>
      )}
    </Prompt>
  );
};

export const Onboarding = () => {
  return (
    <div className={styles.pageContainer}>
      <Outlet />
    </div>
  );
};
