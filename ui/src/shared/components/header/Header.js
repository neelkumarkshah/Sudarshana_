import React, { useContext } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";

import brandLogo from "../../../shared/assets/images/sudarshanaLogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDigitalTachograph,
  faSignOutAlt,
  faShieldAlt,
  faArrowRightToBracket,
  faEnvelope,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import classes from "./Header.module.css";
import { AuthContext } from "../../context/auth-context";

const Header = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? classes.active : "";
  };

  return (
    <Navbar collapseOnSelect expand="lg" className={classes.header}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={brandLogo}
            alt="Sudarshana Logo"
            className={classes.brandLogo}
            width={200}
            height={200}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      </Container>
      <Container>
        <Navbar.Collapse
          className={`justify-content-end ${classes.navCollapse}`}
          id="responsive-navbar-nav"
        >
          <Nav>
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

            {!auth.isLoggedIn && (
              <Nav.Link
                as={Link}
                to="/"
                className={`${classes.navLink} ${isActive("/")}`}
              >
                <FontAwesomeIcon icon={faHome} className={classes.icon} />
                <span>Home</span>
              </Nav.Link>
            )}

            {!auth.isLoggedIn && (
              <Nav.Link
                as={Link}
                to="/contact"
                className={`${classes.navLink} ${isActive("/contact")}`}
              >
                <FontAwesomeIcon icon={faEnvelope} className={classes.icon} />
                <span>Contact Us</span>
              </Nav.Link>
            )}
            {auth.isLoggedIn ? (
              <Nav.Link
                as={Link}
                className={`${classes.navLink}`}
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className={classes.icon} />
                <span>Logout</span>
              </Nav.Link>
            ) : (
              <Nav.Link
                as={Link}
                to="/login"
                className={`${classes.navLink} ${isActive("/login")}`}
              >
                <FontAwesomeIcon
                  icon={faArrowRightToBracket}
                  className={classes.icon}
                />
                <span>Login</span>
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
