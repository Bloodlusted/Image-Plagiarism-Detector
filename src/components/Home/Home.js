import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import homeLogo from "../../Assets/home-main.svg";
import Particle from "../Particle";
import Home2 from "./Home2";
import Type from "./Type";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      // Scroll to the bottom of the page after a delay
      setTimeout(() => {
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
      }, 100);
    }
  }, [selectedFiles]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    setSelectedFiles([...files]);

    // Create a new FormData object
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // Make the POST request to the Flask API
    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData);
      if (response.status === 200) {
        console.log("Images uploaded successfully");
        // Redirect to the results page
        navigate("/results");
      } else {
        console.error("Error uploading images");
        // Handle the error condition appropriately
      }
    } catch (error) {
      console.error("Error uploading images", error);
      // Handle the error condition appropriately
    }
  };

  return (
    <section>
      <Container fluid className="home-section" id="home">
        <Particle />
        <Container className="home-content">
          <Row>
            <Col md={7} className="home-header">
              <h1 style={{ paddingBottom: 15 }} className="heading"></h1>

              <h1 className="heading-name">
                <strong className="main-name">Image Plagiarism Detector</strong>
              </h1>

              <div style={{ padding: 50, textAlign: "left" }}>
                <Type />
              </div>
            </Col>

            <Col md={5} style={{ paddingBottom: 20 }}>
              <img
                src={homeLogo}
                alt="home pic"
                className="img-fluid"
                style={{ maxHeight: "450px" }}
              />
            </Col>
          </Row>
        </Container>
        {selectedFiles.length > 0 && (
          <div style={{ position: "relative" }}>
            <h2 style={{ color: "white" }}>Selected Images</h2>
            <div>
              {selectedFiles.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`selected image ${index}`}
                  style={{ maxHeight: "300px", marginRight: "10px" }}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
      <Home2 />

      {selectedFiles.length === 0 && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          id="file-upload"
          style={{ color: "#cd5ff8", position: "relative", top: "-250px" }}
        />
      )}
    </section>
  );
}

export default Home;
