import React from "react";
import { useRef } from "react";
import { ibm_plex_serif } from "../fonts";
import { formatText } from "../_utils/utils";

const AfterUpload = ({ message }) => {
  let elements = useRef([
    {
      type: null,
      content: null,
    },
  ]);

  formatText(message, elements);

  return (
    <div
      className={`${ibm_plex_serif.className} text-chlorophyll flex flex-col gap-4`}
    >
      {message.length ? (
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
