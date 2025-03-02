import React, { useContext } from "react";
import { Container, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDigitalTachograph,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./Header.module.css";
import { AuthContext } from "../../context/auth-context";

const Header = () => {
  const auth = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? classes.active : "";
  };

  return (
    <Container>
      <Nav
        justify
        variant="tabs"
        defaultActiveKey="/dashboard"
        className={classes.header}
      >
        <Nav.Item>
          {auth.isLoggedIn && (
            <Nav.Link
              as={Link}
              to="/dashboard"
              className={`${classes.navLink} ${isActive("/dashboard")}`}
            >
              <FontAwesomeIcon
                icon={faDigitalTachograph}
                className={classes.icon}
              />
              <span>Dashboard</span>
            </Nav.Link>
          )}
          {auth.isLoggedIn && (
            <Nav.Link
              as={Link}
              to="/pentesting"
              className={`${classes.navLink} ${isActive("/pentesting")}`}
            >
              <FontAwesomeIcon icon={faShieldAlt} className={classes.icon} />
              <span>Pentest</span>
            </Nav.Link>
          )}
        </Nav.Item>
      </Nav>
    </Container>
  );
};

export default Header;
