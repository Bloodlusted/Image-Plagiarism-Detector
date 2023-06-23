import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiPython,
  SiPytorch,
  SiYolo,
  SiTensorflow,
  SiKeras,
  SiSpacy,
} from "react-icons/si";

function Techstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <SiPython />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiPytorch />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiYolo />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiTensorflow />
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiSpacy />
      </Col>
    </Row>
  );
}

export default Techstack;
