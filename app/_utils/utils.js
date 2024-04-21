import { useRef } from "React";

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
