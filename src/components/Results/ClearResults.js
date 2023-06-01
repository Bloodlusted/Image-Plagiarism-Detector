import React from "react";
import { Button } from "react-bootstrap";

function ClearResults({ clearResults }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
      <Button variant="danger" onClick={clearResults}>
        Clear Results
      </Button>
    </div>
  );
}

export default ClearResults;
