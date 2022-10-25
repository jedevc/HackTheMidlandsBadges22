import React, { useEffect, useState } from "react";
import styles from "./home.module";
import Button from "../../components/button";
import QrReader from "react-qr-reader";
import { FaIdBadge } from "react-icons/fa";
import { useLocation, useHistory } from "react-router-dom";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { api } from "../../api";

export const Home = ({}) => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  if (query.has("token")) {
    return <Login token={query.get("token")} />;
  } else {
    return <Scanner />;
  }
};

const Login = ({ token }) => {
  const history = useHistory();
  const [storedKey, setStoredKey] = useLocalStorage("token", undefined);

  useEffect(() => {
    api({ path: "permissions", token })
      .then((permissions) => {
        const id = permissions.store.badges.write[0];
        if (!permissions.store.keys.read.includes("code")) {
          throw new Error("Provided token cannot read code");
        }
        if (!permissions.store.keys.write.includes("code")) {
          throw new Error("Provided token cannot write code");
        }
        setStoredKey(token);
        return id;
      })
      .then((id) => {
        history.push("/dev/" + id);
      })
      .catch((error) => {
        history.push("/error", { error });
      });
  }, []);

  return <></>;
};

const reToken = /^(.*?)([a-z]{3})([a-zA-Z0-9]+)$/;

const Scanner = () => {
  const [target, setTarget] = useState();

  const handleScan = (result) => {
    if (result) {
      const match = result.match(reToken);
      if (!match) return;
      const [prefix, shortcode, tkn] = match.slice(1);
      if (shortcode.toLowerCase() == "bdg") {
        setTarget(shortcode + tkn);
      }
    }
  };
  const handleError = console.error;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.page}>
        <div className={styles.title}>HackTheMidlands Badges</div>
        <div className={styles.contents}>
          <p>Welcome to the HackTheMidlands Badge Portal! 🎉</p>
          <QrReader
            style={{ width: "100%" }}
            onScan={handleScan}
            onError={handleError}
          />
          {target ? (
            <Button
              color="rgb(59, 102, 250)"
              text="View Badge"
              link={`/view/${target}`}
              icon={<FaIdBadge />}
            />
          ) : (
            <p>Scan a badge to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};
