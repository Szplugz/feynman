import React from "react";
import { ibm_plex_sans, ibm_plex_serif } from "../fonts";

const BeforeUpload = () => {
  return (
    <div className={`${ibm_plex_serif.className} w-full flex flex-col gap-6`}>
      <p>
        Academic publications, especially in fields like medicine, epidemiology,
        and psychology, can contain tons of valuable information that is
        directly relevant to our daily lives.{" "}
      </p>
      <p>
        Unfortunately, most of this information is hidden behind mathematical
        language and industry-specific jargon that makes it difficult for
        outsiders to understand what the paper is trying to say.
      </p>
      <p>
        This is because these papers are intended to be read by other academics,
        not by everyday people.
      </p>
      <p>In the age of AI, that need not be the case.</p>
      <p>
        <span className={`${ibm_plex_sans.className}`}>feynman</span> simplifies
        academic publications without loss of information and extracts relevant,
        actionable insights from them in a manner that everyone can understand.
      </p>
    </div>
  );
};

export default BeforeUpload;
