import React from 'react';
import Modal from 'react-modal';
import './ConfirmationModal.css'; // Optional: for custom styling

// Bind modal to app element
Modal.setAppElement('#root');

const ConfirmationModal = ({ isOpen, onRequestClose, message, onConfirm, onCancel }) => {
  return (
    
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirmation Modal"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>Confirmation</h2>
      </div>
      <div className="modal-body">
        <p>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-confirm" onClick={onConfirm}>Ok</button>
        <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
