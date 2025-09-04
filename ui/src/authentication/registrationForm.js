import React, { useState, lazy, startTransition, useEffect } from "react";
import "react-phone-input-2/lib/style.css";
import { Form, Row, Col, Card, FloatingLabel, Alert } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";

import brandLogo from "../shared/assets/images/sudarshanaLogo.png";
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
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const onSubmit = async (data) => {
    setError("");
    setSuccessMessage("");
    setShowOverlay(true);
    setModalMessage("Validating and Verifying your details, please wait...");

    try {
      await sleep(1500);

      const phoneNumber = data.phoneNumber.replace(/^\d{2}/, "");
      const modifiedData = { ...data, phoneNumber };

      const response = await window.api.invoke("registerUser", modifiedData);

      if (response?.success) {
        setSuccessMessage(
          response.message || "Account created successfully! Redirecting..."
        );
        reset();
        setTimeout(() => {
          startTransition(() => navigate("/"));
        }, 2000);
      } else {
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err?.message || "An unexpected error occurred. Please try again later."
      );
    } finally {
      setShowOverlay(false);
    }
  };

  const handleLoginClick = (event) => {
    event.preventDefault();
    startTransition(() => {
      navigate("/");
    });
  };

  const styles = {
    input: {
      width: "100%",
      height: "calc(3.5rem + 2px)",
      borderRadius: "0.375rem",
      border: "1px solid #dee2e6",
    },
    dropdown: { fontFamily: "Inter", fontSize: "1rem" },
  };

  return (
    <div className={classes.authForm}>
      <Row className="justify-content-center w-100">
        <Col sm={12} md={12} lg={5} className={classes.brandLogoCol}>
          <img
            src={brandLogo}
            alt="Sudarshana Logo"
            className={classes.brandLogo}
          />
        </Col>
        <Col
          sm={12}
          md={1}
          lg={1}
          className="d-flex justify-content-center align-items-center"
        >
          <hr className={classes.hr} />
        </Col>
        <Col sm={12} md={12} lg={5}>
          <CardLayout>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                            enableSearch
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
                  <Col sm={12}>
                    <span>Already have an account? </span>
                    <Link
                      to="/"
                      onClick={handleLoginClick}
                      className={classes.authLink}
                    >
                      Login
                    </Link>
                  </Col>
                  <Col sm={12} className="mt-3 mb-2">
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
