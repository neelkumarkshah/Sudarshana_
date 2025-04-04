import React from "react";
import { Row, Col, Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";

import SideNav from "../sidenav/SideNav";
import classes from "./Layout.module.css";

const Layout = () => {
  return (
    <Container fluid className={classes.layoutContainer}>
      <Row className="gx-0">
        <Col xs={12} md={12} lg={2} className={classes.sideNav}>
          <SideNav />
        </Col>

        <Col xs={12} md={12} lg={10} className={classes.mainContent}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;

/* <div className="p-0 m-0">
  <Row className="gx-0">
    <Col
      xs={12}
      md={3}
      lg={2}
      className={`${classes.sideNavCol} d-none d-md-block`}
    >
      <SideNav />
    </Col>
    <Col xs={12} md={9} lg={10} className={`${classes.mainContent}`}>
      <Outlet />
    </Col>
  </Row>
</div>; */
