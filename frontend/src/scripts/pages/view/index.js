import React, { useEffect } from "react";
import useSWR from "swr";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./view.module";

import Button from "../../components/button";
import Badge from "../../components/badge";
import { FaEdit } from "react-icons/fa";
import { api } from "../../api";

const View = () => {
  const navigate = useNavigate();

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
      navigate("/onboarding", { state: { badge: { id: id } } });
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
    navigate("/error", { state: { error } });
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
