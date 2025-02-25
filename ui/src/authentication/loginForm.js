import React, { useState, useContext, startTransition } from "react";
import { Form, Row, Col, Card, FloatingLabel, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";

import ModalOverlay from "../shared/components/uiElements/modalOverlay/ModalOverlay";
import { AuthContext } from "../shared/context/auth-context";
import classes from "./authForm.module.css";
import CardLayout from "../shared/components/uiElements/card/Card";
import ButtonLayout from "../shared/components/uiElements/button/Button";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LoginForm = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const [error, setError] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Fetching and Verifying your details, please wait..."
  );

  const onSubmit = async (data) => {
    setError(null);
    setShowOverlay(true);
    setModalMessage("Fetching and Verifying your details, please wait...");

    try {
      await sleep(3000);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed: ", response.message);
      }

      const responseData = await response.json();
      auth.login(responseData.userId, responseData.token);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setShowOverlay(false);
    }
  };

  const handleSignupClick = (event) => {
    event.preventDefault();
    startTransition(() => {
      navigate("/signup");
    });
  };

  return (
    <div className={classes.authForm}>
      <Row className="justify-content-center w-100">
        <Col sm={12} md={8} lg={4} className={classes.boxForm}>
          <CardLayout>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col sm={12} md={12} lg={12}>
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
                  <Col sm={12} md={12} lg={12}>
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
                </Row>
                <Row className="mt-3 mb-3">
                  <Col sm={12} md={12} lg={12}>
                    <span>Don&apos;t have an account? </span>
                    <Link
                      to="/signup"
                      onClick={handleSignupClick}
                      className={classes.signupLink}
                    >
                      Sign up
                    </Link>
                  </Col>
                  <Col sm={12} md={12} lg={12} className="mt-3">
                    {error && (
                      <Alert variant="danger" className="text-danger">
                        {error}
                      </Alert>
                    )}
                  </Col>
                </Row>
                <ButtonLayout type="submit" className={classes.authBtn}>
                  Login
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

export default LoginForm;
