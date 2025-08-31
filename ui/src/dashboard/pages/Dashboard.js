import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Alert } from "react-bootstrap";

import DashboardContent from "../components/DashboardContent";
import { useAuth } from "../../shared/hooks/auth-hook";
import classes from "./Dashboard.module.css";

const Dashboard = () => {
  const [scanData, setScanData] = useState([]);
  const [errors, setErrors] = useState("");

  const { token, userId } = useAuth();

  const fetchScanData = useCallback(async () => {
    if (userId && token) {
      try {
        const response = await window.api.invoke("fetchScan", {
          token,
          userId,
        });

        if (response.success) {
          setScanData(response.data);
          setErrors("");
        } else {
          setErrors(response.message);
        }
      } catch (error) {
        setErrors(error.message);
      }
    }
  }, [userId, token]);

  useEffect(() => {
    fetchScanData();
  }, [fetchScanData]);

  return (
    <div className={classes.dashboardPage}>
      <Row className={classes.dashboardRow}>
        <Col xs={12} md={12} lg={12}>
          {errors && (
            <Alert variant="danger" className="text-danger">
              {errors}
            </Alert>
          )}
        </Col>
        <Col xs={12} md={12} lg={12}>
          <DashboardContent
            scanData={scanData}
            token={token}
            refreshScans={fetchScanData}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
