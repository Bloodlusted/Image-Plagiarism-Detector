import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Plagiarism cases have been increasing with the rise of AI tools.<br/><br/>
            While educational institutions already use third party services to detect text-based plagiarism, there is currently nothing to detect plagiarism in <span className="purple"> images.</span>
            <br /><br/>Our tool was developed to bridge this gap and detect <span className="purple"> image-based plagiarism.</span>
            <br />
            <br />
            With our tool, educational institutions can:
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Detect cases of potential image-based plagiarism
            </li>
            <li className="about-activity">
              <ImPointRight /> See the percentage of similarity between images 
            </li>
            <li className="about-activity">
              <ImPointRight /> Maintain academic integrity
            </li>
          </ul>

        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
