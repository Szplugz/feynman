"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Header from "./_components/Header";
import UploadButton from "./_components/UploadButton";
import AfterUpload from "./_views/AfterUpload";
import BeforeUpload from "./_views/BeforeUpload";
import { flushSync } from "react-dom";

// Pieces of state that live here: hasFileUploaded
// In order for a file to have successfully uploaded, it must be sent to the backend,
// and we must get a 200 from the backend, indicating that the file was the correct format and
// was able to be successfully converted to images
// Once the file has successfully been converted to images, the ui should show a loading state until we recieve the first
// piece of data from the server

let i = 0;

async function* streamAsyncIterator(stream) {
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

// Better way to split phrase into last word and everything before that?
const joinWords = (phrase) => {
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

export default function Home() {
  const [file, setFile] = useState(null);
  const [hasFileUploaded, setHasFileUploaded] = useState(false);
  const [messages, setMessage] = useState("");
  // Every buffer that is sent should consist of only full words
  // Which means that each valud buffer ends in a whitespace
  const buffer = useRef("");

  const handleFileChange = async (file) => {
    // send file to backend
    console.log("Sending file to backend");
    setHasFileUploaded(true);
    const formData = new FormData();
    formData.append("files", file);

    const requestOptions = { method: "POST", body: formData };

    const response = await fetch("/api/upload", requestOptions);
    // if response from api is ok, set hasFileUploadedToTrue

    for await (const chunk of streamAsyncIterator(response.body)) {
      flushSync(() => {
        console.log("Incoming chunk: ", JSON.stringify(chunk));
        console.log("Current buffer: ", JSON.stringify(buffer.current));
        buffer.current = buffer.current.concat(chunk);
        if (buffer.current.includes(" ")) {
          console.log(
            "Buffer now contains whitespace - ",
            JSON.stringify(buffer.current)
          );
          const bufferParts = joinWords(buffer.current);
          // Send the complete word()
          console.log(`Sending ${bufferParts[0]} to backend`);
          setMessage(bufferParts[0]);
          buffer.current = bufferParts[1];
          console.log(`Setting buffer to ${bufferParts[1]}`);
        }
      });
      // setTrigger((oldTrigger) => oldTrigger + 1);
    }
  };

  const uploadFile = (event) => {
    setFile(event.target.files[0]);
  };

  useEffect(() => {
    file && handleFileChange(file);
  }, [file]);

  return (
    <main className="bg-eggshell flex flex-col min-h-screen items-center justify-between py-24">
      <div className="md:max-w-[600px] flex flex-col gap-10 text-xl">
        <Header></Header>
        {hasFileUploaded ? (
          <>
            <AfterUpload messages={messages}></AfterUpload>
          </>
        ) : (
          <BeforeUpload uploadFile={uploadFile}></BeforeUpload>
        )}
        <div className="flex justify-center">
          <UploadButton handleUpload={uploadFile}></UploadButton>
        </div>
      </div>
    </main>
  );
}
