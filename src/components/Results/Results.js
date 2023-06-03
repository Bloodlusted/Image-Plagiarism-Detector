import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Particle from "../Particle";
import axios from "axios";

function Results() {
  const [similarityResults, setSimilarityResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get("/api/results");
      setSimilarityResults(response.data.results);
    } catch (error) {
      console.log(error);
    }
  };

  const clearResults = async () => {
    try {
      await axios.post("/api/clear");
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
          <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
            {similarityResults.length === 0 || similarityResults.every(result => result.similarity.length === 0) ? (
              <Col md={12}>
                <h3 style={{ color: "#c770f0", textAlign: "center" }}><br/>
                  No similar images found
                </h3>
              </Col>
            ) : (
              similarityResults.map((result, index) => {
                const similarities = Array.isArray(result.similarity)
                  ? result.similarity
                  : [];
  
                // Filter out entries with empty similarity values
                const validSimilarities = similarities.filter(
                  (similarity) => similarity.similarity !== ""
                );
  
                // Render the result only if there are valid similarity entries
                if (validSimilarities.length === 0) {
                  return null;
                }
  
                return (
                  <Col md={6} className="project-card" key={index}>
                    <div className="project-info">
                      <h4 style={{ color: "#c770f0", marginBottom: "0.7em" }}>{result.filename}</h4>
                      {validSimilarities.map((similarity, similarityIndex) => (
                        <h6 key={similarityIndex} style={{ color: "#FFFFF0" }}>
                          Similarity with {similarity.filename} - <span style={{ color: "#d9f070", fontSize: "1.1em", fontWeight: "bold" }}>{similarity.similarity}</span><br/><br/>
                          <img src={`data:image/gif;base64,${similarity.data}`} alt={`Similar Image ${similarityIndex}`} style={{ maxWidth: "100%", height: "auto" }} />
                        </h6>
                      ))}
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Container>
      </Container>
      <div style={{ display: "flex", justifyContent: "center", margin: "10px" }}>
        <button className="cssbutton" onClick={clearResults}>Clear Results</button>
      </div>
    </section>
  );
  
}

export default Results;
