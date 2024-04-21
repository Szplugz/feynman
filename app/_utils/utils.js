import { useRef } from "React";

const isListItem = (text) => /^\s*<li>/.test(text);
const isParagraph = (text) => /^\s*<p>/.test(text);
const isHeadingOne = (text) => /^\s*<h1>/.test(text);
const isHeadingTwo = (text) => /^\s*<h2>/.test(text);
const hasNewline = (text) => text.includes("\n");

export const stringToHtml = (string, trim = true) => {
  string = trim ? string.trim() : string;
  if (!string) return null;

  // HTML5 has <template> elements which are used to declare fragments of HTML that
  // can be used in scripts. Set up a new template element.
  const template = document.createElement("template");
  template.innerHTML = string;
  const result = template.content.children;

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  if (result.length === 1) return result[0];
  return result;
};

/* Removes html tags from strings */
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

/* Splits buffer around last whitespace */
const splitBufferByLastWhitespace = (phrase) => {
  const parts = phrase.split(" ");
  let completePhrase = "";
  let lastWord = "";
  parts.map((part, index) => {
    if (index < parts.length - 1) {
      completePhrase = completePhrase.concat(`${part} `);
    } else {
      lastWord = part;
    }
  });
  return [completePhrase, lastWord];
};

/* Ensures that the chunks of text used to update the state consist of whole words.*/
export const awaitWhitespace = (chunk, buffer) => {
  console.log("Incoming chunk: ", JSON.stringify(chunk));
  console.log("Current buffer: ", JSON.stringify(buffer.current));
  buffer.current = buffer.current.concat(chunk);

  // Once the buffer contains a whitespace, we update the state with everything before the whitespace
  // and only store everything that comes after it
  if (buffer.current.includes(" ")) {
    console.log(
      "Buffer now contains whitespace - ",
      JSON.stringify(buffer.current)
    );
    const bufferParts = splitBufferByLastWhitespace(buffer.current);
    // Send the complete word()
    console.log(`Sending ${bufferParts[0]} to backend`);
    buffer.current = bufferParts[1];
    console.log(`Setting buffer to ${bufferParts[1]}`);
    return bufferParts[0];
  }
};

export async function* streamAsyncIterator(stream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const { done, value } = await reader.read();
      // Exit if we're done
      if (done) {
        // If done, yield the last chunk if there is any
        if (value) {
          // console.log("reading: ", new TextDecoder().decode(value));
          yield new TextDecoder().decode(value);
        }
        return; // Exit the loop
      }
      // Else yield the chunk
      // console.log("reading: ", new TextDecoder().decode(value));
      yield new TextDecoder().decode(value);
    }
  } finally {
    console.log("done");
    reader.releaseLock();
  }
}

// I should probably write a hook to handle streaming
// so that the chunks it sends to this component are
// *complete*. i.e if I'm denoting the start of a list
// by <li> or 1. or whatever, they will arrive here exactly
// in the shape of <li> or 1. and not <li, > or <l, i> or 1, . etc
// Maybe the hook takes an argument containing all of the
// tokens it should look out for, and if it sees part of that token
// in the stream, it waits for the other part(s) before forwarding it

/*
Formats the text according to its corresponding html element and stores it
in a ref of the form: 
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
export const formatText = (text, elements) => {
  const insertTextIntoElement = (text) => {
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

  console.log(`formatting ${text}`);
  if (text === undefined || text === "") {
    return;
  }
  // First full chunk
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
    // we need a catch-all to make sure it gets read as a paragraph. Need to fix this sooner or later tho
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
    insertTextIntoElement(currentElementChunk);
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
    insertTextIntoElement(text);
  }
};
