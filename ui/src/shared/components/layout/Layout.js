import React from "react";
import { Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";

import SideNav from "../sidenav/SideNav";
import classes from "./Layout.module.css";

const Layout = () => {
  return (
    <div className="p-0 m-0">
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
    </div>
  );
};

export default Layout;
