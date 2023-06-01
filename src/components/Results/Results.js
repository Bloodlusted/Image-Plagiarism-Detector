import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Particle from "../Particle";
import axios from "axios";
import ClearResults from "./ClearResults";

function Results() {
  const [similarityResults, setSimilarityResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/results");
      setSimilarityResults(response.data.results);
    } catch (error) {
      console.log(error);
    }
  };

  const clearResults = async () => {
    try {
      await axios.post("http://localhost:5000/api/clear");
      setSimilarityResults([]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section>
    <Container fluid className="project-section">
      <Particle />
      <Container>
        <h1 className="project-heading">
          <strong className="purple">Results</strong>
        </h1>
        <p style={{ color: "white" }}>
          <h5>This is how similar your image is compared to other images from our database.</h5>
        </p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px"}}>
          {similarityResults.map((result, index) => {
            const similarities = Array.isArray(result.similarity) ? result.similarity : [];

            // Filter out entries with empty similarity values
            const validSimilarities = similarities.filter((similarity) => similarity.similarity !== "");

            // Render the result only if there are valid similarity entries
            if (validSimilarities.length === 0) {
              return null;
            }

            return (
              <Col md={6} className="project-card" key={index}>
                <div className="project-info">
                  <h4 style={{color: "#cd5ff8"}}>{result.filename}</h4><br/>
                  {validSimilarities.map((similarity, similarityIndex) => (
                    <p key={similarityIndex} style={{color:"#FFFFF0"}}>
                      Similarity with {similarity.filename} - {similarity.similarity}
                    </p>
                  ))}
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </Container>
    <ClearResults clearResults={clearResults} />
    </section>
  );
}

export default Results;
