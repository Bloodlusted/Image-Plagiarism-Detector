import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          "Compare Similarity between Images",
          "Outputs Similarity Score in %",
          "Lists sources of Plagiarism",
          "Powered by Artificial Intelligence",
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
      }}
    />
  );
}

export default Type;
