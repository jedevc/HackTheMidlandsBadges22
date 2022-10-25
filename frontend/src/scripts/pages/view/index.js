import React, { useEffect } from "react";
import useSWR from "swr";
import { useHistory, useParams } from "react-router-dom";
import styles from "./view.module";

import Button from "../../components/button";
import Badge from "../../components/badge";
import { FaEdit } from "react-icons/fa";
import { api } from "../../api";

const View = () => {
  const history = useHistory();

  const { id } = useParams();
  const { data: badge } = useSWR(
    {
      path: `badges/${id}`,
      token: process.env.PLATFORM_DEFAULT_TOKEN,
    },
    api
  );
  useEffect(() => {
    if (badge && !badge.claimed) {
      history.push("/onboarding", { badge: { id: id } });
    }
  }, [badge]);

  const { data: code, error } = useSWR(
    {
      path: `store/${id}/code`,
      token: process.env.PLATFORM_DEFAULT_TOKEN,
    },
    api
  );
  if (error) {
    history.push("/error", { error });
  }
  return (
    <>
      <div className={styles.paneToolbar}>
        {badge && (
          <Button
            text="Edit"
            icon={<FaEdit />}
            color="#ff7365"
            link={`/dev/${badge.id}`}
          />
        )}
      </div>
      <Badge program={code ? code.value : null} />
    </>
  );
};

export default View;
