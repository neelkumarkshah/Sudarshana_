import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDigitalTachograph,
  faSignOutAlt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

import brandLogo from "../../../shared/assets/images/sudarshanaLogo.png";
import classes from "./SideNav.module.css";
import { AuthContext } from "../../context/auth-context";

const SideNav = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const isActive = (path) => (location.pathname === path ? classes.active : "");

  return (
    <aside className={`${classes.sidenav}`}>
      <Link to="/" className={classes.logo}>
        <img
          src={brandLogo}
          alt="Sudarshana Logo"
          className={classes.brandLogo}
        />
      </Link>
      <hr className={classes.hr} />
      <div>
        {auth.isLoggedIn && (
          <Button
            as={Link}
            to="/dashboard"
            className={`${classes.navLink} ${isActive("/dashboard")}`}
          >
            <FontAwesomeIcon
              icon={faDigitalTachograph}
              className={classes.icon}
            />
            <span>Dashboard</span>
          </Button>
        )}

        {auth.isLoggedIn && (
          <Button
            as={Link}
            to="/pentesting"
            className={`${classes.navLink} ${isActive("/pentesting")}`}
          >
            <FontAwesomeIcon icon={faShieldAlt} className={classes.icon} />
            <span>Pentest</span>
          </Button>
        )}

        {auth.isLoggedIn && (
          <Button
            className={`${classes.navLink} ${classes.logoutBtn}`}
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className={classes.icon} />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
};

export default SideNav;
