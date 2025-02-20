import React from "react";
import { Row, Col, Container } from "react-bootstrap";
// import LazyLoad from "react-lazyload";
import { useNavigate } from "react-router-dom";

import Content from "../../shared/components/uiElements/content/Content";
import HomeContentData from "./HomeContent.json";
import ButtonLayout from "../../shared/components/uiElements/button/Button";
import HeroImage from "../../shared/assets/images/Hero.gif";
import Security1 from "../../shared/assets/images/Security1.gif";
import Security2 from "../../shared/assets/images/Security2.gif";
import Security3 from "../../shared/assets/images/Security3.gif";
import Security4 from "../../shared/assets/images/Security4.gif";
import Security5 from "../../shared/assets/images/Security5.gif";
import ContactUs from "../../shared/assets/images/ContactUs.gif";
import classes from "./Home.module.css";

const gifMap = {
  "Our Mission": Security1,
  "Who We Are": Security2,
  "Our Focus": Security3,
  "Our Approach": Security4,
  "Why Choose Us": Security5,
  "Contact Us": ContactUs,
};

const HomeContent = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className={classes.homeSection}>
      <section className={classes.heroSection}>
        <Container fluid className={classes.heroContainer}>
          <Row className={`align-items-center ${classes.heroRow}`}>
            <Col md={6} className={classes.heroText}>
              <h1 className={classes.heroTitle}>
                Cutting-edge security Solutions for Unmatched Digital Excellence
              </h1>
              <p className={classes.heroDescription}>
                Strengthen your security posture with our top-notch
                Vulnerability Assessment and Penetration Testing services,
                designed for businesses seeking strong protection against cyber
                threats.
              </p>
              <ButtonLayout
                className={classes.heroButton}
                onClick={handleGetStarted}
              >
                Get Started
              </ButtonLayout>
            </Col>
            <Col md={6} className={classes.heroImageCol}>
              <img
                src={HeroImage}
                alt="VAPT Services"
                className={classes.heroImage}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <Content className={classes.sectionContent}>
        {HomeContentData.sections.map((section, index) => (
          <Row key={index} className={classes.sectionRow}>
            {index % 2 === 0 ? (
              <>
                <Col md={6} className={classes.textCol}>
                  <h2 className={classes.sectionTitle}>{section.title}</h2>
                  <p className={classes.sectionDescription}>
                    {section.description}
                  </p>
                  {section.list && (
                    <ul className={classes.sectionList}>
                      {section.list.map((item, idx) =>
                        typeof item === "string" ? (
                          <li key={idx}>{item}</li>
                        ) : (
                          <li key={idx}>
                            <strong>{item.title}</strong> {item.description}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                  {section.contact && (
                    <p>
                      <strong>{section.contact.split(":")[0]}:</strong>
                      {section.contact.split(":")[1]}
                    </p>
                  )}
                </Col>
                <Col md={6} className={classes.gifCol}>
                  {/* <LazyLoad height={200} offset={100}> */}
                  <img
                    src={gifMap[section.title]}
                    alt={section.title}
                    className={classes.gif}
                  />
                  {/* </LazyLoad> */}
                </Col>
              </>
            ) : (
              <>
                <Col md={6} className={classes.gifCol}>
                  {/* <LazyLoad height={200} offset={200} once> */}
                  <img
                    src={gifMap[section.title]}
                    alt={section.title}
                    className={classes.gif}
                  />
                  {/* </LazyLoad> */}
                </Col>
                <Col md={6} className={classes.textCol}>
                  <h2 className={classes.sectionTitle}>{section.title}</h2>
                  <p className={classes.sectionDescription}>
                    {section.description}
                  </p>
                  {section.list && (
                    <ul className={classes.sectionList}>
                      {section.list.map((item, idx) =>
                        typeof item === "string" ? (
                          <li key={idx}>{item}</li>
                        ) : (
                          <li key={idx}>
                            <strong>{item.title}</strong> {item.description}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                  {section.contact && (
                    <p className={classes.sectionDescription}>
                      <strong>{section.contact.split(":")[0]}:</strong>
                      {section.contact.split(":")[1]}
                    </p>
                  )}
                </Col>
              </>
            )}
          </Row>
        ))}
      </Content>
    </div>
  );
};

export default HomeContent;
