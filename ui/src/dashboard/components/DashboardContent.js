import React, { useState, useEffect } from "react";
import { Card, Table, Alert, Pagination, Button, Form } from "react-bootstrap";
import DashboardTableLoader from "./DashboardTableLoader";
import ModalOverlay from "../../shared/components/uiElements/modalOverlay/ModalOverlay";
import pdfIconOn from "../../shared/assets/images/pdfIconOn.png";
import pdfIcon from "../../shared/assets/images/pdfIcon.png";
import classes from "./DashboardContent.module.css";

const cssOverride = `
  .table {
    border-collapse: collapse; 
    width: 100%;
    max-height: 70vh;
    text-align: center;
  }

  .table th,
  .table td {
    font-size: 1rem;
    border: none;
    padding: 0.7%;
    vertical-align: middle; 
  }

  .table tbody tr {
    border-bottom: 0.1rem solid #dedfe1; 
  }

  .table th{
    color: #1c3144;
  }

  .table td{
    color: #767b85;
  }

  .table thead tr {
    border-bottom: 0.1rem solid #dedfe1;
  }

  .table tbody tr:hover {
    cursor: pointer;
  }

  .table tbody tr:hover > td {
    background-color: #f2f7f5 !important; 
  }

  .page-link{
    color: #1c3144 !important;
  }

  .active>.page-link{
    background-color: #1c3144 !important;
    border-color: #1c3144 !important;
    color: #ffffff !important;
  }

  .page-link:hover, .page-link:active{
    background-color: #1c3144 !important;
    border-color: #1c3144 !important;
    color: #ffffff !important;
  }

  @media (max-width: 576px) {
    .table th,
    .table td {
      font-size: 0.7rem;
      padding: 1rem 0.5rem;
    }
  }

  @media (max-width: 768px) {
    .table th,
    .table td {
      font-size: 0.7rem;
      padding: 1rem 0.5rem;
    }
  }
;`;

const DashboardContent = ({ scanData, token, refreshScans }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "We are preparing your PDF report, please wait..."
  );
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iconState, setIconState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScans, setSelectedScans] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [scanData]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCheckboxChange = (scanId) => {
    setSelectedScans((prev) =>
      prev.includes(scanId)
        ? prev.filter((id) => id !== scanId)
        : [...prev, scanId]
    );
  };

  const handleDelete = async () => {
    if (selectedScans.length === 0) {
      setNotification({
        type: "warning",
        text: "Please select scans to delete.",
      });
      return;
    }

    try {
      const response = await window.api.invoke("deleteScan", {
        scanIds: selectedScans,
        token,
      });

      if (response?.success) {
        setSelectedScans([]);
        setNotification({
          type: "success",
          text: response?.message || "Scans deleted successfully.",
        });
        await refreshScans();
      } else {
        setNotification({
          type: "danger",
          text: response?.message || "Some scans could not be deleted.",
        });
      }
    } catch (err) {
      setNotification({
        type: "danger",
        text: err?.message || "Unexpected error occurred while deleting scans.",
      });
    }
  };

  const handleDownload = async (scanId, applicationName, index) => {
    try {
      setShowOverlay(true);
      setIconState((prev) => ({ ...prev, [index]: "clicked" }));
      setModalMessage("We are preparing your PDF report, please wait...");

      setTimeout(() => {
        setModalMessage("PDF report is being downloaded...");

        setTimeout(async () => {
          try {
            const response = await window.api.invoke("downloadPDF", {
              scanId,
              token,
              applicationName,
            });

            if (!response?.success) {
              throw new Error(response?.message || "Failed to generate PDF.");
            }

            const blob = new Blob(
              [Uint8Array.from(atob(response.file), (c) => c.charCodeAt(0))],
              { type: "application/pdf" }
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", response.pdfName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setIconState((prev) => ({ ...prev, [index]: "default" }));
            setNotification({
              type: "success",
              text: "PDF report downloaded successfully.",
            });
          } catch (error) {
            setNotification({
              type: "danger",
              text: error.message || "An error occurred during PDF download.",
            });
          } finally {
            setIconState((prev) => ({ ...prev, [index]: "default" }));
            setShowOverlay(false);
          }
        }, 1500);
      }, 5000);
    } catch (err) {
      setNotification({
        type: "danger",
        text: err?.message || "Unexpected error occurred in download flow.",
      });
      setShowOverlay(false);
    }
  };

  const formatDate = (date) => {
    const options = {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleString("en-IN", options);
    return (
      formattedDate.replace(/am|pm/i, (match) => match.toUpperCase()) + " IST"
    );
  };

  const trimText = (text, length = 15) => {
    if (!text) return "";
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  const totalPages = Math.ceil(scanData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = scanData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <style>{cssOverride}</style>
      {loading ? (
        <DashboardTableLoader />
      ) : scanData && scanData.length > 0 ? (
        <Card className={classes.dashboardCard}>
          <Card.Body>
            <div className="d-flex justify-content-between mb-3">
              <h5>Scan Records</h5>
              <Button
                variant="danger"
                disabled={selectedScans.length === 0}
                onClick={handleDelete}
                className={classes.deleteButton}
              >
                Delete Scan
              </Button>
            </div>
            <div className="table-responsive">
              <Table>
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>ID</th>
                    <th>App Name</th>
                    <th>Scan Type</th>
                    <th>Targeted URL</th>
                    <th>Total Issues</th>
                    <th>Date</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((scan, index) => (
                    <tr key={scan._id}>
                      <td className="text-center align-middle">
                        <Form.Check
                          type="checkbox"
                          id={`scan-checkbox-${scan._id}`}
                          checked={selectedScans.includes(scan._id)}
                          onChange={() => handleCheckboxChange(scan._id)}
                          label=""
                          className="d-inline-block"
                        />
                      </td>
                      <td>{`#${scan._id.slice(0, 4)}...${scan._id.slice(
                        -4
                      )}`}</td>
                      <td>{trimText(scan.applicationName, 18)}</td>
                      <td>{scan.scanType}</td>
                      <td>{trimText(scan.targetedUrl, 25)}</td>
                      <td>{scan.issues.length}</td>
                      <td>{formatDate(scan.timestamp)}</td>
                      <td>
                        <img
                          src={
                            iconState[index] === "clicked"
                              ? pdfIconOn
                              : iconState[index] === "hovered"
                              ? pdfIconOn
                              : pdfIcon
                          }
                          alt="PDF Icon"
                          className={classes.pdfIcon}
                          onMouseEnter={() =>
                            setIconState((prev) => ({
                              ...prev,
                              [index]: "hovered",
                            }))
                          }
                          onMouseLeave={() =>
                            setIconState((prev) => ({
                              ...prev,
                              [index]: "default",
                            }))
                          }
                          onClick={() =>
                            handleDownload(
                              scan._id,
                              scan.applicationName,
                              index
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination className="justify-content-center mt-4 mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {[...Array(totalPages).keys()].map((pageNumber) => (
                  <Pagination.Item
                    key={pageNumber + 1}
                    active={pageNumber + 1 === currentPage}
                    onClick={() => handlePageChange(pageNumber + 1)}
                  >
                    {pageNumber + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className={classes.dashboardCard}>
          <Alert
            variant="info"
            className={`text-center text-info ${classes.alert}`}
          >
            No data available.
          </Alert>
        </Card>
      )}

      {notification && (
        <Alert variant={notification.type} className="mt-4">
          {notification.text}
        </Alert>
      )}

      <ModalOverlay
        show={showOverlay}
        onHide={() => setShowOverlay(false)}
        message={modalMessage}
      />
    </>
  );
};

export default DashboardContent;
