import React from "react";

import { Container } from "react-bootstrap";
import classes from "./Content.module.css";

const Content = ({ children, className, ...props }) => {
  return (
    <div className={`${classes.content} ${className}`} {...props}>
      <Container>{children}</Container>
    </div>
  );
};

export default Content;
