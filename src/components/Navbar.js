import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import { NavDropdown } from "react-bootstrap";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineFund,
  AiOutlineInfoCircle,
  AiOutlineUser,
  AiOutlineLogout,
} from "react-icons/ai";

function NavBar({ isLoggedIn, handleLogout, username }) {
  const [expand, updateExpanded] = useState(false);
  const [navColour, updateNavbar] = useState(false);

  function scrollHandler() {
    if (window.scrollY >= 20) {
      updateNavbar(true);
    } else {
      updateNavbar(false);
    }
  }

  window.addEventListener("scroll", scrollHandler);

  return (
    <Navbar
      expanded={expand}
      fixed="top"
      expand="md"
      className={navColour ? "sticky" : "navbar"}
    >
      <Container>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={() => {
            updateExpanded(expand ? false : "expanded");
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto" defaultActiveKey="#home">
            <Nav.Item>
              <Nav.Link as={Link} to="/" onClick={() => updateExpanded(false)}>
                <AiOutlineHome style={{ marginBottom: "4px" }} /> Home
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/about"
                onClick={() => updateExpanded(false)}
              >
                <AiOutlineInfoCircle style={{ marginBottom: "4px" }} /> About
              </Nav.Link>
            </Nav.Item>

            {isLoggedIn && (
              <Nav.Item>
                <Nav.Link
                as={Link}
                to="/results"
                onClick={() => updateExpanded(false)}
              >
                <AiOutlineFund style={{ marginBottom: "4px" }} /> Results
              </Nav.Link>
            </Nav.Item>
            )}

            {isLoggedIn && (
              <NavDropdown title={<span><AiOutlineUser style={{ marginBottom: "4px"}} /> {username}</span>} id="nav-dropdown" className="dropdown">
                <NavDropdown.Item onClick={handleLogout}>
                  <AiOutlineLogout style={{ marginBottom: "4px" }} /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}

            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
