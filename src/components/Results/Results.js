import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import Particle from "../Particle";
import axios from "axios";

function Results({ isLoggedIn }) {
  const navigate = useNavigate();
  const [similarityResults, setSimilarityResults] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/'); // Redirect to main home page if user is not logged in
    } else {
      fetchResults();
    }
  }, [isLoggedIn, navigate]);

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
          <p style={{ color: "white", fontSize:"1.25em" }}>
            This is how similar your image is compared to other images from our database.
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
                      <h4 className="purple" style={{ marginBottom: "0.7em" }}>{result.filename}</h4>
                      {validSimilarities.map((similarity, similarityIndex) => (
                        <h6 key={similarityIndex} style={{ color: "#FFFFF0" }}>
                          Similarity with {similarity.filename} - <span style={{ color: "#d3ff08", fontSize: "1.1em", fontWeight: "bold" }}>{similarity.similarity}</span><br/><br/>
                          <img src={`data:image/png;base64,${similarity.data}`} alt={`Similar Image ${similarityIndex}`} style={{ maxWidth: "100%", height: "auto", marginBottom: 40 }} />
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
