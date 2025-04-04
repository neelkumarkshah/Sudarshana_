import React, { useState, useEffect } from "react";
import { Card, Table, Alert, Pagination } from "react-bootstrap";
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

const DashboardContent = ({ scanData, token }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "We are preparing your PDF report, please wait..."
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [iconState, setIconState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [scanData]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleHover = (index) => {
    if (!iconState[index] || iconState[index] === "default") {
      setIconState((prev) => ({ ...prev, [index]: "hovered" }));
    }
  };

  const handleLeave = (index) => {
    if (!iconState[index] || iconState[index] === "hovered") {
      setIconState((prev) => ({ ...prev, [index]: "default" }));
    }
  };

  const handleDownload = async (scanId, applicationName, index) => {
    setShowOverlay(true);
    setIconState((prev) => ({ ...prev, [index]: "clicked" }));
    setModalMessage("We are preparing your PDF report, please wait...");

    setTimeout(() => {
      setModalMessage("PDF report is being downloaded...");

      setTimeout(async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/pentesting/downloadPdf/${scanId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              method: "GET",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to download PDF");
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `${applicationName}_Security_Assessment_Report.pdf`
          );
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          setIconState((prev) => ({ ...prev, [index]: "default" }));
        } catch (error) {
          setError(error.message || "An error occurred during PDF download.");
        } finally {
          setShowOverlay(false);
        }
      }, 1500);
    }, 5000);
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
    const dateOfScan =
      formattedDate.replace(/am|pm/i, (match) => match.toUpperCase()) + " IST";

    return dateOfScan;
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
            <div className="table-responsive">
              <Table>
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Application Name</th>
                    <th>Scan Type</th>
                    <th>Targeted URL</th>
                    <th>Total Issues</th>
                    <th>Date</th>
                    <th>PDF Report</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((scan, index) => (
                    <tr key={scan._id}>
                      <td>{`#${scan._id.slice(0, 4)}...${scan._id.slice(
                        -4
                      )}`}</td>
                      <td>{scan.applicationName}</td>
                      <td>{scan.scanType}</td>
                      <td>{scan.targetedUrl}</td>
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
                          onMouseEnter={() => handleHover(index)}
                          onMouseLeave={() => handleLeave(index)}
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
          <Alert variant="info" className={`text-center ${classes.alert}`}>
            No data available.
          </Alert>
        </Card>
      )}
      {error && <Alert variant="danger">{error.message || error}</Alert>}
      <ModalOverlay
        show={showOverlay}
        onHide={() => setShowOverlay(false)}
        message={modalMessage}
      />
    </>
  );
};

export default DashboardContent;
