import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa'; // Import from fa module
import { IoIosTime } from 'react-icons/io';
import StoreSelector from './StoreSelector';

const NtidVerificationModal = ({
  show,
  onHide,
  title,
  ntid,
  setNtid,
  username,
  isVerifying,
  error,
  filteredNtid,
  stores,
  searchTerm,
  setSearchTerm,
  selectedStore,
  onVerify,
}) => (
  <Modal show={show} onHide={onHide} centered size="md">
    {username ? (
      <div className="text-center p-0 p-md-4 p-lg-4">
        <FaCheckCircle size={50} color="green" className="mb-3" />
        <h4 className="fw-bold text-success">Verified</h4>
        <p className="fw-semibold text-primary">{username}</p>
        <h4 className="fw-bolder">
          <IoIosTime className="fs-1" /> Wait a moment ...
        </h4>
      </div>
    ) : (
      <Modal.Body className="text-center p-4 p-md-5">
        <Modal.Title className="w-100 text-center mb-4 fw-bolder text-gradient">{title}</Modal.Title>
        <div className={`d-flex border rounded ${filteredNtid ? 'border-success fw-bolder' : ''}`}>
          <Form.Control
            className="border-0 shadow-none text-center w-100"
            type="text"
            placeholder="Enter NTID"
            value={ntid}
            onChange={(e) => setNtid(e.target.value)}
            disabled={isVerifying}
          />
          {filteredNtid && <FaCheckCircle className="text-success mt-2 me-2" />}
        </div>

        {filteredNtid && (
          <StoreSelector
            stores={stores}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSelect={setSearchTerm}
            disabled={isVerifying}
          />
        )}

        <Button
          variant="success"
          className="w-100 mt-4"
          onClick={onVerify}
          disabled={isVerifying || !filteredNtid || !selectedStore}
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>

        {error && (
          <div className="alert alert-danger mt-2" role="alert">
            {error}
          </div>
        )}
      </Modal.Body>
    )}
  </Modal>
);

export default NtidVerificationModal;