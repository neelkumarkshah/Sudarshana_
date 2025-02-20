"use client";

import React, { useState, useEffect } from "react";
import { Form, Row, Col, Card, FloatingLabel } from "react-bootstrap";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import CardLayout from "@/app/components/card/card";
import ButtonLayout from "@/app/components/button/button";
import { redirect } from "next/navigation";

const profileSchema = yup.object().shape({
  profileImage: yup
    .string()
    .url("Invalid URL format")
    .required("Profile Image URL is required"),
});

const Profile = ({ user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    setValue("profileImage", user.profileImage || "");
  }, [user, setValue]);

  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/users/profile`,
        {
          userId: user._id,
          profileImage: data.profileImage,
        }
      );
      if (response.status === 200) {
        redirect("/profile");
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
    <>
      <h1 className="text-center">Profile</h1>
      <CardLayout>
        <Row className="justify-content-center">
          <Col md={12} lg={8}>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  <Col md={12}>
                    <FloatingLabel
                      controlId="floatingProfileImage"
                      label="Profile Image URL"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Profile Image URL"
                        {...register("profileImage")}
                        isInvalid={!!errors.profileImage}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.profileImage?.message}
                      </Form.Control.Feedback>
                    </FloatingLabel>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    {error && <p className="text-danger">{error}</p>}
                    <ButtonLayout type="submit">Update Profile</ButtonLayout>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </CardLayout>
    </>
  );
};

export default Profile;
