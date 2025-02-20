import React from "react";

import { Button } from "react-bootstrap";
import classes from "./Button.module.css";

const ButtonLayout = ({ children, className, ...props }) => {
  return (
    <Button className={`${classes.button} ${className}`} {...props}>
      {children}
    </Button>
  );
};

export default ButtonLayout;
