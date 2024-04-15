import React from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  const isListItem = (text) => /^\d+\./.test(text) || text.length == 0;

  /*

  {
    type: "paragraph",
    content: [
      "This is a sampl",
      "e paragraph respo",
      "nse. Just like",
      " lists, paragr",
      "aphs will be spl",
      "it up into an arr",
      "ay of chunks."
    ]
  },
  {
    type: "list",
    content: [
      [
        "1. This is meant",
        " to sim",
        "ulate a sample l",
        "ist of chunks. "
      ],
      [
        "2. Each list it",
        "em will be split i",
        "nto several chunks ",
        "the way they arrive."
      ]
    ]
  }

  */

  const formatText = (text) => {
    const lines = text.split("\n");
    console.log(lines.length);
    const formattedLines = [];
    let line = lines.shift();
    while (lines.length) {
      if (line.length == 0) {
        line = lines.shift();
        continue;
      }
      let elem = { type: "null", content: [] };
      if (isListItem(line)) {
        elem["type"] = "list";
        elem["content"] = [];
        let i = 0;
        while (lines.length && isListItem(line)) {
          // console.log("line is list item");
          if (line.length !== 0) {
            elem["content"].push(line);
          }
          line = lines.shift();
        }
      } else {
        elem["type"] = "paragraph";
        elem["content"] = line;
        line = lines.shift();
      }
      formattedLines.push(elem);
    }
    return formattedLines;
  };

  // console.log(formatText(messages));

  return (
    <div>
      {messages.length ? (
        formatText(messages).map((message, index) => {
          if (message["type"] == "paragraph") {
            return <div key={index}>{message["content"]}</div>;
          } else {
            let listItems = message["content"];
            return (
              <ul>
                {listItems.map((item, index) => {
                  return <li key={index}>{item}</li>;
                })}
              </ul>
            );
          }
        })
      ) : (
        <h1>File Upload Successful!</h1>
      )}
    </div>
  );
};

export default AfterUpload;
