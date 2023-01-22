import React, { useEffect, useState } from "react";
import styles from "./home.module";
import Button from "../../components/button";
import QrReader from "react-qr-reader";
import { FaIdBadge } from "react-icons/fa";
import { useLocation, useHistory } from "react-router-dom";
import useLocalStorage from "../../../hooks/useLocalStorage";
import { api } from "../../api";

export const Home = ({}) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.page}>
        <div className={styles.title}>HackTheMidlands Badges</div>
        <div className={styles.contents}>
          <p>Welcome to the HackTheMidlands Badge Portal! 🎉</p>
          <Button
            color="rgb(59, 102, 250)"
            text="Try the demo now!"
            link={`/demo`}
            icon={<FaIdBadge />}
          />
          <p>
            This is an archived version of the HackTheMidlands 2022 Badge
            website - if you've still got your badge from the event, you can
            scan the QR code on it to view your badge, you can no longer edit
            the code on it.
          </p>
        </div>
      </div>
    </div>
  );
};
