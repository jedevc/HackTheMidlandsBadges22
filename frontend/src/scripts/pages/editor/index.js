import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./editor.module";

import Splitter, { SplitDirection } from "@devbookhq/splitter";
import Monaco from "@monaco-editor/react";
import Badge from "../../components/badge";

import { FaGlasses, FaSave } from "react-icons/fa";
import { api } from "../../api";
import Button from "../../components/button";
import useLocalStorage from "../../../hooks/useLocalStorage";

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

const Editor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [storedKey, setStoredKey] = useLocalStorage("token", undefined);
  if (!storedKey) {
    const state = id ? { badge: { id } } : null;
    useEffect(() => {
      navigate("/onboarding", { state });
    });
    return <></>;
  }

  let [program, setProgram] = useState("-- loading...");
  let [errorMessage, setErrorMessage] = useState(errorMessage);

  const handleChange = (value) => {
    setProgram(value);
    setErrorMessage("");
  };
  const handleSave = () => {
    return api({
      method: "PUT",
      path: `store/${id}/code`,
      token: storedKey,
      body: {
        value: program,
      },
    }).catch(console.error);
  };

  useEffect(() => {
    api({
      path: `store/${id}/code`,
      token: storedKey,
    })
      .then(({ value: program }) => handleChange(program))
      .catch((e) => {
        if (e.httpCode !== 403) throw e;
        const state = id ? { badge: { id } } : null;
        navigate("/onboarding", { state });
      })
      .catch((error) => {
        navigate("/error", { state: { error } });
      });
  }, [id, storedKey]);

  const handleError = (err) => {
    let message = err.toString();
    if (err.message.startsWith(`[string "`)) {
      const [location, lineRaw, msg] = err.message.split(":");
      if (msg) {
        let line = parseInt(lineRaw) - 1;
        const lines = program.split("\n");

        let start = line - 1;
        let end = line + 1;
        if (start < 0) {
          end -= start;
          start = 0;
        }
        if (end >= lines.length) {
          start -= end - lines.length + 1;
          end = lines.length - 1;
        }
        if (start < 0) {
          start = 0;
        }

        message = `${msg.trim()} on line ${line}\n`;
        for (let i = start; i <= end; i++) {
          let iStr = String(i).padStart(String(lines.length).length, " ");
          message += `${i == line ? ">" : " "} ${iStr} | ${lines[i]}\n`;
        }
      }
    }
    setErrorMessage(message);
  };

  return (
    <div className={styles.editor}>
      <div className={styles.paneToolbar}>
        <Button
          text="Save"
          icon={<FaSave />}
          color="#3b66fa"
          onClick={handleSave}
        />
        <Button
          text="View"
          icon={<FaGlasses />}
          color="#ff7365"
          link={`/view/${id}`}
        />
      </div>
      <Splitter direction={SplitDirection.Horizontal}>
        <Splitter direction={SplitDirection.Vertical} initialSizes={[90, 10]}>
          <div className={styles.paneEditor}>
            <Monaco
              value={program}
              language="lua"
              theme="vs-dark"
              onChange={handleChange}
            />
          </div>
          <div className={styles.paneError}>{errorMessage}</div>
        </Splitter>

        <div className={styles.paneBadge}>
          <Badge program={program} onError={handleError} />
        </div>
      </Splitter>
    </div>
  );
};

export default Editor;
