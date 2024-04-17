import React from "react";
import { useRef } from "react";
import { ibm_plex_serif } from "../fonts";

const AfterUpload = ({ messages }) => {
  // let messages = messageArray.length
  //   ? messageArray[messageArray.length - 1]
  //   : "";
  // const isListItem = (text) => /^\d+\.?/.test(text);
  const isListItem = (text) => /^\s*<li>/.test(text);
  const isParagraph = (text) => /^\s*<p>/.test(text);
  const isHeadingOne = (text) => /^\s*<h1>/.test(text);
  const isHeadingTwo = (text) => /^\s*<h2>/.test(text);
  const hasNewline = (text) => text.includes("\n");

  const removeTag = (phrase, tag) => {
    console.log(`REMOVING ${tag} FROM ${phrase}`);
    if (!tag) {
      console.log("no tag to filter out");
      return;
    }
    const parts = phrase.split(tag);
    console.log("Parts: ", parts);
    return parts[parts.length - 1];
  };

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

  // I should probably write a hook to handle streaming
  // so that the chunks it sends to this component are
  // *complete*. i.e if I'm denoting the start of a list
  // by <li> or 1. or whatever, they will arrive here exactly
  // in the shape of <li> or 1. and not <li, > or <l, i> or 1, . etc
  // Maybe the hook takes an argument containing all of the
  // tokens it should look out for, and if it sees part of that token
  // in the stream, it waits for the other part(s) before forwarding it
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
            content: [[removeTag(text, "<li>")]],
          },
        ];
      } else if (isHeadingOne(text)) {
        elements.current = [
          {
            type: "h1",
            content: [removeTag(text, "<h1>")],
          },
        ];
      } else if (isHeadingTwo(text)) {
        elements.current = [
          {
            type: "h2",
            content: [removeTag(text, "<h2>")],
          },
        ];
      }
      // There's no guarantee that claude starts the message with <h1>, so for the first chunk,
      // we need a catch-all to make sure it gets read as a paragraph. Need to fix this tho
      else {
        elements.current = [
          {
            type: "paragraph",
            content: [removeTag(text, "<p>")],
          },
        ];
      }
    } else if (hasNewline(text)) {
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
        const numElements = elements.current.length;
        const currentElement = elements.current[numElements - 1];
        // If prev elem was also a list item
        if (currentElement["type"] == "list") {
          // Add to current list
          currentElement["content"].push([removeTag(nextElementChunk, "<li>")]);
        } else {
          // If next item is a list item, but prev elem was a paragraph, start new list
          const numElements = elements.current.length;
          const currentElement = elements.current[numElements - 1];
          console.log(
            `!!!!!!! ${currentElementChunk} IS PART OF A PARAGRAPH, BUT ${nextElementChunk} IS THE START OF A LIST`
          );
          elements.current.push({
            type: "list",
            content: [[removeTag(nextElementChunk, "<li>")]],
          });
        }
      } else if (nextElementChunk.length) {
        if (isParagraph(nextElementChunk)) {
          // Else add to current paragraph
          elements.current.push({
            type: "paragraph",
            content: [removeTag(nextElementChunk, "<p>")],
          });
        } else if (isHeadingOne(nextElementChunk)) {
          elements.current.push({
            type: "h1",
            content: [removeTag(nextElementChunk, "<h1>")],
          });
        } else {
          elements.current.push({
            type: "h2",
            content: [removeTag(nextElementChunk, "<h2>")],
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
    <div
      className={`${ibm_plex_serif.className} text-chlorophyll flex flex-col gap-4`}
    >
      {messages.length ? (
        elements.current.map((message, index) => {
          if (message["type"] == "h1") {
            return (
              <h1 key={index} className="h1 text-4xl font-medium">
                {message["content"].map((chunk, index) => {
                  return (
                    <span key={index} className="chunk">
                      {chunk}
                    </span>
                  );
                })}
              </h1>
            );
          } else if (message["type"] == "h2") {
            return (
              <h2 key={index} className="h2 text-2xl font-medium">
                {message["content"].map((chunk, index) => {
                  return (
                    <span key={index} className="chunk">
                      {chunk}
                    </span>
                  );
                })}
              </h2>
            );
          } else if (message["type"] == "paragraph") {
            return (
              <p key={index} className="paragraph text-xl">
                {message["content"].map((chunk, index) => {
                  return (
                    <span key={index} className="chunk">
                      {chunk}
                    </span>
                  );
                })}
              </p>
            );
          } else if (message["type"] == "list") {
            let listItems = message["content"];
            return (
              <ol className="list list-decimal">
                {listItems.map((item, index) => {
                  return (
                    <li key={index} className="pl-2 marker:text-bronze">
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
              </ol>
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
