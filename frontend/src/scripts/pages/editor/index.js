import React, { useEffect, useState, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import styles from "./editor.module";

import Splitter, { SplitDirection } from "@devbookhq/splitter";
import Monaco from "@monaco-editor/react";
import Badge from "../../components/badge";
import { FaGlasses, FaSave } from "react-icons/fa";

import { api } from "../../api";
import Button from "../../components/button";
import useLocalStorage from "../../../hooks/useLocalStorage";
import useBoundingClientRect from "../../../hooks/useBoundingClientRect";
import { defaultProgram } from "./default";

const Editor = () => {
  const history = useHistory();
  const { id } = useParams();

  const [storedKey, setStoredKey] = useLocalStorage("token", undefined);
  if (!storedKey) {
    const state = id ? { badge: { id } } : null;
    useEffect(() => {
      history.push("/onboarding", state);
    });
    return <></>;
  }

  const [program, setProgram] = useState("-- loading...");
  const [saved, setSaved] = useState(true);
  const [errorMessage, setErrorMessage] = useState(errorMessage);

  const editorRef = useRef(null);
  const editorRect = useBoundingClientRect(editorRef);

  const save = (value) => {
    return api({
      method: "PUT",
      path: `store/${id}/code`,
      token: storedKey,
      body: { value },
    });
  };

  useEffect(() => {
    api({
      path: `store/${id}/code`,
      token: storedKey,
    })
      .then(({ value: program }) => {
        if (program !== null) return program;
        return api({
          path: `users/${id}`,
          token: storedKey,
        }).then(({ name }) => {
          const program = defaultProgram.replaceAll("{user}", name);
          return save(program).then(() => program);
        });
      })
      .then((program) => {
        setProgram(program);
        setSaved(true);
      })
      .catch((e) => {
        if (e.httpCode !== 403) throw e;
        const state = id ? { badge: { id } } : null;
        history.push("/onboarding", state);
      })
      .catch((error) => {
        history.push("/error", { error });
      });
  }, [id, storedKey]);

  const handleChange = (value) => {
    setProgram(value);
    setErrorMessage("");
    setSaved(false);
  };

  const handleSave = () => {
    save(program);
    setSaved(true);
  };

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

  const editorPane = (
    <Tabbed>
      <Tabs>
        <Tab content={`badge.lua${!saved ? " *" : ""}`} active={true} />
      </Tabs>
      <Content>
        <div className={styles.paneEditor}>
          <Monaco
            value={program}
            language="lua"
            theme="vs-dark"
            onChange={handleChange}
          />
        </div>
      </Content>
    </Tabbed>
  );
  const errorPane = (
    <Tabbed>
      <Tabs>
        <Tab content="error.log" active={errorMessage} />
      </Tabs>
      <Content>
        <div className={styles.paneError}>{errorMessage}</div>
      </Content>
    </Tabbed>
  );
  const badgePane = (
    <div className={styles.paneBadge}>
      <Badge program={program} onError={handleError} />
    </div>
  );
  return (
    <div className={styles.editor} ref={editorRef}>
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
      {editorRect && editorRect.width < 600 ? (
        editorPane
      ) : (
        <Splitter direction={SplitDirection.Horizontal}>
          <Splitter
            direction={SplitDirection.Vertical}
            initialSizes={errorMessage ? [85, 15] : [95, 5]}
          >
            {editorPane}
            {errorPane}
          </Splitter>
          {badgePane}
        </Splitter>
      )}
    </div>
  );
};

const Tabbed = ({ children }) => {
  return <div className={styles.tabAll}>{children}</div>;
};

const Tabs = ({ children }) => {
  return <div className={styles.tabTop}>{children}</div>;
};
const Tab = ({ content, active = false, onClick = null }) => {
  return (
    <span
      className={`${styles.tabItem} ${active ? styles.tabActive : ""}`}
      onClick={onClick}
    >
      {content}
    </span>
  );
};
const Content = ({ children }) => {
  return <div className={styles.tabBottom}>{children}</div>;
};

export default Editor;
