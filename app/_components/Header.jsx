import React from "react";
import { ibm_plex_sans } from "../fonts";

const Header = () => {
  return (
    <div className="w-full flex flex-row justify-between">
      <h1 className={`${ibm_plex_sans.className} text-chlorophyll text-4xl`}>
        <em>f</em>eynman
      </h1>
    </div>
  );
};

export default Header;
