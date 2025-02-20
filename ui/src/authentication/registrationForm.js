import React, { useState, lazy } from "react";
import "react-phone-input-2/lib/style.css";
import { Form, Row, Col, Card, FloatingLabel, Alert } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";

import ModalOverlay from "../shared/components/uiElements/modalOverlay/ModalOverlay";
import classes from "./authForm.module.css";
import CardLayout from "../shared/components/uiElements/card/Card";
import ButtonLayout from "../shared/components/uiElements/button/Button";

const PhoneInput = lazy(() => import("react-phone-input-2"));

const registrationSchema = yup.object().shape({
  name: yup.string().required("Full Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RegistrationForm = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(registrationSchema),
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Validating and Verifying your details, please wait..."
  );

  const onSubmit = async (data) => {
    setError("");
    setSuccessMessage("");
    setShowOverlay(true);
    setModalMessage("Validating and Verifying your details, please wait...");

    try {
      await sleep(5000);

      const phoneNumber = data.phoneNumber.replace(/^\d{2}/, "");
      const modifiedData = { ...data, phoneNumber };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modifiedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData)) {
          throw new Error(errorData.map((err) => err.message).join("\n"));
        } else {
          throw new Error(errorData.message || "Registration failed");
        }
      }

      setSuccessMessage("Registration successful!");
      reset();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setShowOverlay(false);
    }
  };

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
    modalContent: {
      backgroundColor: "#1c3144",
      border: "none",
      color: "#f2f7f5",
      borderRadius: "6px",
      padding: "20px",
    },
    spinner: {
      color: "#f2f7f5",
      borderWidth: "0.15rem",
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
    
  .form-floating>label{
    z-index: 0 !important;
  }`;

  return (
    <div className={classes.authForm}>
      <Row className="justify-content-center w-100">
        <Col md={8} lg={6}>
          <CardLayout>
            <style>{cssOverride}</style>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={12}>
                    <FloatingLabel
                      controlId="floatingName"
                      label="Full Name"
                      className="mb-3"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Full Name"
                        {...register("name")}
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name?.message}
                      </Form.Control.Feedback>
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
                        {...register("email")}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel controlId="floatingPhone" className="mb-3">
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            country={"in"}
                            value={field.value}
                            onChange={field.onChange}
                            enableSearch={true}
                            dropdownStyle={styles.dropdown}
                            searchPlaceholder="Search..."
                            inputProps={{
                              name: "phoneNumber",
                              required: true,
                              autoFocus: false,
                            }}
                            containerStyle={{
                              width: "100%",
                            }}
                            inputStyle={styles.input}
                          />
                        )}
                      />
                      {errors.phoneNumber && (
                        <div className="invalid-feedback d-block">
                          {errors.phoneNumber.message}
                        </div>
                      )}
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <FloatingLabel
                      controlId="floatingPassword"
                      label="Password"
                      className="mb-3"
                    >
                      <Form.Control
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        isInvalid={!!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password?.message}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                  <Col md={6}>
                    <FloatingLabel
                      controlId="floatingConfirmPassword"
                      label="Confirm Password"
                      className="mb-3"
                    >
                      <Form.Control
                        type="password"
                        placeholder="Confirm Password"
                        {...register("passwordConfirm")}
                        isInvalid={!!errors.passwordConfirm}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.passwordConfirm?.message}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} md={12} lg={12} className="mt-3 mb-2">
                    {error && (
                      <Alert variant="danger" className="text-danger">
                        {error}
                      </Alert>
                    )}
                    {successMessage && (
                      <Alert variant="success" className="text-success">
                        {successMessage}
                      </Alert>
                    )}
                  </Col>
                </Row>
                <ButtonLayout type="submit" className={classes.authBtn}>
                  Register
                </ButtonLayout>
              </Form>
            </Card.Body>
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

export default RegistrationForm;
