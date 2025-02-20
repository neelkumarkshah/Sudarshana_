import React from "react";
import { Spinner, Modal } from "react-bootstrap";
import classes from "./ModalOverlay.module.css";

const ModalOverlay = ({ show, onHide, message }) => {
  const cssOverride = `
    .modal-body p {
      color: #ffffff
    }
  `;

  const styles = {
    modalContent: {
      backgroundColor: "#1c3144",
      border: "none",
      color: "#f2f7f5",
      borderRadius: "6px",
      padding: "20px",
    },
    spinner: {
      color: "#f2f7f5",
      borderWidth: "0.15rem",
    },
  };

  return (
    <>
      <style>{cssOverride}</style>
      <Modal
        show={show}
        onHide={onHide}
        backdropClassName={classes.modalBackdrop}
        backdrop="static"
        keyboard={false}
        centered
        size="sm"
      >
        <Modal.Body style={styles.modalContent} className="text-center">
          <Spinner animation="border" style={styles.spinner} role="status" />
          <p className="mt-3 text-center">{message}</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalOverlay;
