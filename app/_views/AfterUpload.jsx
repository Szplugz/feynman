import React from "react";
import { useRef } from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  // let messages = messageArray.length
  //   ? messageArray[messageArray.length - 1]
  //   : "";
  const isListItem = (text) => /^\d+\./.test(text);
  const hasNewline = (text) => text.includes("\n");

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

  let elements = useRef([
    {
      type: null,
      content: null,
    },
  ]);

  const insertText = (text) => {
    if (text == "") {
      return;
    }
    const numElements = elements.current.length;
    const currentElement = elements.current[numElements - 1];
    if (currentElement["type"] == "list") {
      console.log(`! ADDING ${currentElement} TO CURRENT LIST ITEM`);
      const numListItems = currentElement["content"].length;
      currentElement["content"][numListItems - 1].push(text);
    } else {
      currentElement["content"].push(text);
    }
  };

  const formatText = (text) => {
    console.log(`formatting ${text}`);
    if (text === undefined || text === "") {
      return;
    }
    if (elements.current[0].type === null) {
      if (isListItem(text)) {
        elements.current = [
          {
            type: "list",
            content: [[]],
          },
        ];
      } else {
        elements.current = [
          {
            type: "paragraph",
            content: [],
          },
        ];
      }
    }
    if (hasNewline(text)) {
      // first part goes into current element, second part goes into new element
      let parts = text.split("\n");
      parts = parts.filter((part) => hasNewline(part) == false);
      const currentElementChunk = parts[0];
      insertText(currentElementChunk);
      const nextElementChunk = parts[parts.length - 1];
      console.log(
        `!!! FOUND NEWLINE in ${text} BETWEEN ${currentElementChunk} and ${nextElementChunk}`
      );
      if (isListItem(nextElementChunk)) {
        if (isListItem(currentElementChunk)) {
          // Add to current list but create new list item
          const numElements = elements.current.length;
          const currentElement = elements.current[numElements - 1];
          currentElement["content"].push([nextElementChunk]);
        } else {
          // If next item is a list item, but prev elem was a paragraph, start new list
          const numElements = elements.current.length;
          const currentElement = elements.current[numElements - 1];
          console.log(
            `!!!!!!! ${currentElement} IS PART OF A PARAGRAPH, BUT ${nextElementChunk} IS THE START OF A LIST`
          );
          elements.current.push({
            type: "list",
            content: [[nextElementChunk]],
          });
        }
      } else {
        // Else add to current paragraph
        if (nextElementChunk.length) {
          elements.current.push({
            type: "paragraph",
            content: [nextElementChunk],
          });
        }
      }
    } else {
      insertText(text);
    }
  };

  formatText(messages);
  console.log(elements.current);

  // const formatText = (text) => {
  //   const lines = text.split("\n");
  //   console.log(lines.length);
  //   const formattedLines = [];
  //   let line = lines.shift();
  //   while (lines.length) {
  //     if (line.length == 0) {
  //       line = lines.shift();
  //       continue;
  //     }
  //     let elem = { type: "null", content: [] };
  //     if (isListItem(line)) {
  //       elem["type"] = "list";
  //       elem["content"] = [];
  //       let i = 0;
  //       while (lines.length && isListItem(line)) {
  //         // console.log("line is list item");
  //         if (line.length !== 0) {
  //           elem["content"].push(line);
  //         }
  //         line = lines.shift();
  //       }
  //     } else {
  //       elem["type"] = "paragraph";
  //       elem["content"] = line;
  //       line = lines.shift();
  //     }
  //     formattedLines.push(elem);
  //   }
  //   return formattedLines;
  // };

  // console.log(formatText(messages));

  return (
    <div>
      {messages.length ? (
        elements.current.map((message, index) => {
          if (message["type"] == "paragraph") {
            return (
              <div key={index} className="paragraph">
                {message["content"].map((chunk, index) => {
                  return (
                    <span key={index} className="chunk">
                      {chunk}
                    </span>
                  );
                })}
              </div>
            );
          } else {
            let listItems = message["content"];
            return (
              <ul className="list">
                {listItems.map((item, index) => {
                  return (
                    <li key={index}>
                      {item.map((chunk, i) => {
                        return (
                          <span key={i} className="chunk">
                            {chunk}
                          </span>
                        );
                      })}
                    </li>
                  );
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
