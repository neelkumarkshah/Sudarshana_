import React, { useState, useEffect } from "react";
import { Row, Col, Alert } from "react-bootstrap";

import DashboardContent from "../components/DashboardContent";
import { useAuth } from "../../shared/hooks/auth-hook";
import classes from "./Dashboard.module.css";

const Dashboard = () => {
  const [scanData, setScanData] = useState([]);
  const [errors, setErrors] = useState("");

  const { token, userId } = useAuth();

  useEffect(() => {
    const fetchScanData = async () => {
      if (userId && token) {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/users/scans/${userId}`,
            {
              headers: {
                authorization: `Bearer ${token}`,
              },
              method: "GET",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch scan data");
          }

          const data = await response.json();
          const ScanRecords = data.scanRecords || [];
          setScanData(ScanRecords);
        } catch (error) {
          setErrors(error.message);
        }
      }
    };

    fetchScanData();
  }, [userId, token]);

  return (
    <div className={classes.dashboardPage}>
      <Row className={classes.dashboardRow}>
        <Col xs={12}>
          {errors && (
            <Alert variant="danger" className="text-danger">
              {errors}
            </Alert>
          )}
        </Col>
        <Col xs={12}>
          <DashboardContent scanData={scanData} token={token} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
