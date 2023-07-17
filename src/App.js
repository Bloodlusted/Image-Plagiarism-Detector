import React, { useState, useEffect } from "react";
import Preloader from "../src/components/Pre";
import Navbar from "./components/Navbar";
import Home from "./components/Home/Home";
import About from "./components/About/About";
import Results from "./components/Results/Results";
import Footer from "./components/Footer";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import "./style.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [load, upadateLoad] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume user is not logged in initially
  const [username, setUsername] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      upadateLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const isLoggedInStorage = localStorage.getItem("isLoggedIn");
    const usernameStorage = localStorage.getItem("username");
    if (isLoggedInStorage === "true") {
      setIsLoggedIn(true);
      setUsername(usernameStorage);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    localStorage.removeItem("isLoggedIn"); // Remove the login status from localStorage
    localStorage.removeItem("username");
  };

  return (
    <Router>
      <Preloader load={load} />
      <div className="App" id={load ? "no-scroll" : "scroll"}>
        <Navbar isLoggedIn={isLoggedIn} username={username} handleLogout={handleLogout} />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />} />
          <Route path="/about" element={<About />} />
          <Route path="/results" element={<Results isLoggedIn={isLoggedIn} />} />
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
