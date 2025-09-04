import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Alert } from "react-bootstrap";

import DashboardContent from "../components/DashboardContent";
import { useAuth } from "../../shared/hooks/auth-hook";
import classes from "./Dashboard.module.css";

const Dashboard = () => {
  const [scanData, setScanData] = useState([]);
  const [errors, setErrors] = useState(null);

  const { token, userId } = useAuth();

  const fetchScanData = useCallback(async () => {
    try {
      const response = await window.api.invoke("fetchScan", {
        token,
        userId,
      });

      if (response?.success) {
        setScanData(response.data || []);
        setErrors(null);
      } else {
        setErrors(response?.message || "Failed to fetch scans from server.");
      }
    } catch (error) {
      setErrors(error?.message || "Unexpected error occurred.");
    }
  }, [userId, token]);

  useEffect(() => {
    // Only fetch when auth details are valid
    if (userId && token) {
      fetchScanData();
    }
  }, [userId, token, fetchScanData]);

  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        setErrors(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <div className={classes.dashboardPage}>
      <Row className={classes.dashboardRow}>
        <Col xs={12}>
          <DashboardContent
            scanData={scanData}
            token={token}
            refreshScans={fetchScanData}
          />
        </Col>
        <Col xs={12}>
          {errors && (
            <Alert variant="danger" className="text-danger text-center">
              {errors}
            </Alert>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
