import React, { useEffect, useState, useRef } from "react";
import styles from "../editor/editor.module";

import Splitter, { SplitDirection } from "@devbookhq/splitter";
import Monaco from "@monaco-editor/react";
import Badge from "../../components/badge";
import { FaGlasses, FaSave } from "react-icons/fa";

import Button from "../../components/button";
import useBoundingClientRect from "../../../hooks/useBoundingClientRect";
import { defaultProgram } from "../editor/default";

const Editor = ({ editable = true }) => {
  const [program, setProgram] = useState(
    defaultProgram.replaceAll("{user}", "a demo")
  );
  const [errorMessage, setErrorMessage] = useState(errorMessage);

  const editorRef = useRef(null);
  const editorRect = useBoundingClientRect(editorRef);

  const handleChange = (value) => {
    setProgram(value);
    setErrorMessage("");
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
        <Tab content={`badge.lua`} active={true} />
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
      <div className={styles.paneToolbar} />
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
