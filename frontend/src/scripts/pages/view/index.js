import React, { useEffect } from "react";
import useSWR from "swr";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../../components/badge";
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
  const { data: code } = useSWR(
    {
      path: `store/${id}/code`,
      token: process.env.PLATFORM_DEFAULT_TOKEN,
    },
    api
  );
  useEffect(() => {
    if (badge && !badge.claimed) {
      navigate("/onboarding", { state: { badge: { id: id } } });
    }
  }, [badge]);

  return <Badge program={code ? code.value : null} />;
};

export default View;
