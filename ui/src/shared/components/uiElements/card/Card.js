import React from "react";

import { Card } from "react-bootstrap";
import classes from "./Card.module.css";

const CardBox = ({ children, className, ...props }) => {
  return (
    <Card className={`${classes.card} ${className}`} {...props}>
      {children}
    </Card>
  );
};

export default CardBox;
