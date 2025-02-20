import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { Form, Row, Col, Card, FloatingLabel, Alert } from "react-bootstrap";

import classes from "./ContactForm.module.css";
import ModalOverlay from "../../shared/components/uiElements/modalOverlay/ModalOverlay";
import CardLayout from "../../shared/components/uiElements/card/Card";
import ButtonLayout from "../../shared/components/uiElements/button/Button";

const styles = {
  input: {
    width: "100%",
    height: "calc(3.5rem + 2px)",
    borderRadius: "0.375rem",
    border: "1px solid #dee2e6",
  },
  dropdown: {
    fontFamily: "Inter",
    fontSize: "1rem",
  },
};

const cssOverride = `
.react-tel-input .country-list .search-emoji {
  font-size: 0 !important;
}

.react-tel-input .country-list .search-box {
  margin-left: 0 !important;
  width: 95% !important;
}
`;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    phone: "",
    vaptType: "",
    message: "",
  });
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "We are submitting your details, please wait..."
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phone: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowOverlay(true);
    setModalMessage("We are submitting your details, please wait...");
    setErrorMessages([]);
    setResponseMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrorMessages(data.errors.map((err) => err.msg));
        } else {
          setResponseMessage("Your details has been submitted successfully.");
        }
      } else {
        setResponseMessage(data.message);
      }
    } catch (error) {
      setErrorMessages(error);
    } finally {
      setShowOverlay(false);
    }
  };

  return (
    <div className={classes.contactForm}>
      <Row className="justify-content-center w-100">
        <Col md={10} lg={6}>
          <CardLayout>
            <Row>
              <Col md={12} lg={12}>
                <style>{cssOverride}</style>
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    {responseMessage && (
                      <Alert variant="success">{responseMessage}</Alert>
                    )}
                    {errorMessages.length > 0 && (
                      <Alert variant="danger">
                        {errorMessages.map((msg, idx) => (
                          <div key={idx}>{msg}</div>
                        ))}
                      </Alert>
                    )}
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingFirstName"
                          label="First Name"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingLastName"
                          label="Last Name"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingEmail"
                          label="Email"
                          className="mb-3"
                        >
                          <Form.Control
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingCompanyName"
                          label="Company Name"
                          className="mb-3"
                        >
                          <Form.Control
                            type="text"
                            placeholder="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingSelectGrid"
                          label="VAPT Type"
                          className="mb-3"
                        >
                          <Form.Select
                            aria-label="VAPT Type"
                            name="vaptType"
                            value={formData.vaptType}
                            onChange={handleChange}
                            required
                          >
                            <option>VAPT Target Type</option>
                            <option value="web">Web Application</option>
                            <option value="network">Network</option>
                            <option value="mobile">Mobile Application</option>
                            <option value="cloud">Cloud</option>
                            <option value="api">API</option>
                            <option value="iot">IoT</option>
                          </Form.Select>
                        </FloatingLabel>
                      </Col>
                      <Col md={6}>
                        <FloatingLabel
                          controlId="floatingPhone"
                          label=""
                          className="mb-3"
                        >
                          <PhoneInput
                            country={"in"}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            enableSearch={true}
                            dropdownStyle={styles.dropdown}
                            searchPlaceholder="Search..."
                            inputProps={{
                              name: "phone",
                              required: true,
                              autoFocus: false,
                            }}
                            containerStyle={{
                              width: "100%",
                            }}
                            inputStyle={styles.input}
                          />
                        </FloatingLabel>
                      </Col>
                    </Row>
                    <FloatingLabel
                      controlId="floatingMessage"
                      label="Message"
                      className="mb-3"
                    >
                      <Form.Control
                        as="textarea"
                        placeholder="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={3}
                        required
                      />
                    </FloatingLabel>
                    <ButtonLayout type="submit">Contact us</ButtonLayout>
                  </Form>
                </Card.Body>
              </Col>
            </Row>
          </CardLayout>
        </Col>
      </Row>
      <ModalOverlay
        show={showOverlay}
        onHide={() => setShowOverlay(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default ContactForm;
