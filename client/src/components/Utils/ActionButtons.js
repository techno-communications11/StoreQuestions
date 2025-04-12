import React from 'react';
import { Col, Button } from 'react-bootstrap';
import { BsCheckCircle, BsXCircle, BsEye } from 'react-icons/bs';

const ActionButtons = ({ handleImageAcceptAll, handleOpenFullGallery }) => (
  <Col xs={12} md={2} lg={3} className="ms-auto d-flex justify-content-center gap-2 mb-2 mb-md-0 mt-4">
    <Button
      variant="outline-success"
      size="sm"
      onClick={() => handleImageAcceptAll('yes')}
    >
      <BsCheckCircle className="me-2" />
      Accept All
    </Button>
    <Button
      variant="outline-danger"
      size="sm"
      onClick={() => handleImageAcceptAll('no')}
    >
      <BsXCircle className="me-2" />
      Reject All
    </Button>
    <Button
      variant="outline-secondary"
      size="sm"
      onClick={handleOpenFullGallery}
    >
      <BsEye className="me-2" />
      View All
    </Button>
  </Col>
);

export default ActionButtons;