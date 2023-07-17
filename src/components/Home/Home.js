import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import homeLogo from "../../Assets/home-main.svg";
import Particle from "../Particle";
import Home2 from "./Home2";
import Type from "./Type";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PulseLoader } from "react-spinners";

// Separate login form component
function LoginForm({ setIsLoggedIn, setUsername }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent form submission
    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await axios.post("/api/login", { username, password });

      if (response.status === 200) {
        setIsLoggedIn(true); // Update login status after successful login
        setUsername(response.data.username);
        localStorage.setItem("isLoggedIn", true); // Set the login status in localStorage
        localStorage.setItem("username", response.data.username);
        setError(null);
      } else {
        setError("Error logging in");
        // Handle login failure
      }
    } catch (error) {
      setError(error.response.data.message); // Set the error message from the API response
      // Handle error condition
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <form onSubmit={handleLogin}>
      <label>
        <input type="text" name="username" placeholder=" " required />
        <p style={{ cursor: "text", color: "#c770f0" }}>Username</p>
      </label>
      <label>
        <input
          type={passwordVisible ? "text" : "password"}
          name="password"
          placeholder=" "
          required
        />
        <p style={{ cursor: "text", color: "#c770f0" }}>Password</p>
        <div className="password-icon">
          {passwordVisible ? (
            <img
              src={process.env.PUBLIC_URL + "/eye.svg"}
              alt="Hide Password"
              style={{maxWidth: "1.2rem"}}
              onClick={togglePasswordVisibility}
            />
          ) : (
            <img
              src={process.env.PUBLIC_URL + "/eye-off.svg"}
              alt="Show Password"
              style={{maxWidth: "1.2rem"}}
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      </label>
      <br />
      <button type="submit" className="cssbutton">
        Login
      </button>
      {error && <h6 style={{ color: "red",marginTop: "15px" }}>{error}</h6>}
    </form>
  );
}

function Home({ isLoggedIn, setIsLoggedIn, setUsername }) {
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
      const response = await axios.post("/api/upload", formData);
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
            <div>
              {selectedFiles.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`selected image ${index}`}
                  style={{ maxWidth: "100%", maxHeight: "300px", margin: "10px" }}
                />
              ))}
            <h2 style={{ color: "white", marginTop:30 }}>Uploading Images <PulseLoader color="#c770f0" /></h2>
            </div>
          </div>
        )}
      </Container>
      {selectedFiles.length === 0 && !isLoggedIn && (
        <div className="blurred-background">
          <div className="login">
            <LoginForm setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
          </div>
        </div>
      )}
      <Home2 />
  
      {selectedFiles.length === 0 && isLoggedIn && (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", flexWrap: "wrap"}}>
        <label htmlFor="file-upload" className="cssbutton" style={{ margin: "5px", color: "white", top: "-250px" }}>
          Upload Files
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          id="file-upload"
          style={{ display: "none" }}
        />
        <label htmlFor="folder-upload" className="cssbutton" style={{ margin: "5px", color: "white", top: "-250px" }}>
          Upload Folder
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          id="folder-upload"
          webkitdirectory="true"
          style={{ display: "none" }}
        />
      </div>

      )}
    </section>
  );
  
}

export default Home;
