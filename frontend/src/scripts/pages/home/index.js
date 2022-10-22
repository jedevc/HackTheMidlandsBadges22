import React, { useState } from "react";
import styles from "./home.module";
import Button from "../../components/button";
import QrReader from "react-qr-reader";
import { FaIdBadge } from "react-icons/fa";

const token = /^(.*?)([a-z]{3})([a-zA-Z0-9]+)$/;

export const Home = ({}) => {
  const [target, setTarget] = useState();

  const handleScan = (result) => {
    if (result) {
      const match = result.match(token);
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
