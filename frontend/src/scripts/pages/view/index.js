import React from "react";
import useSWR from "swr";
import { useParams } from "react-router-dom";

import Badge from "../../components/badge";

const defaultProgram = `
title = "John Doe"
content = "Hello I am John Doe!"
k = (k or 0) + 1
for i=1,image_width do
  for j=1,image_height do
    x = (i + j + k) % 100
    image[i][j] = hsl(x / 100, 0.7, 0.5)
  end
end
`;

const View = () => {
  const { id } = useParams();
  const { data, error } = useSWR(
    process.env.PLATFORM_SERVER_URL + `/store/${id}/code`,
    fetch
  );
  console.log("here");
  if (error) {
    console.error(error);
  }
  if (data) {
    data.json().then((body) => console.log(body));
    if (data.ok) {
      console.log(data.json());
    } else {
      console.log("need to provision");
    }
  }

  return <Badge program={defaultProgram} />;
};

export default View;
