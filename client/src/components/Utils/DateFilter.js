import React from 'react';
import { Col, Button } from 'react-bootstrap';

const DateFilter = ({ startDate, setStartDate, endDate, setEndDate, fetchImagesData, loading }) => (
  <>
    <Col xs={12} md={2} lg={3} className="mt-3 d-flex align-items-center mb-2 mb-md-0">
      <label htmlFor="startDate" className="text-success form-label fw-bolder me-2 mb-0">StartDate:</label>
      <input
        type="date"
        id="startDate"
        className="form-control"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
    </Col>
    <Col xs={12} md={2} lg={2} className="mt-3 d-flex align-items-center mb-2 mb-md-0">
      <label htmlFor="endDate" className="form-label fw-bolder text-success me-2 mb-0">EndDate:</label>
      <input
        type="date"
        id="endDate"
        className="form-control"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
    </Col>
    <Col xs={12} md={2} lg={1} className="mt-3 mb-2 mb-md-0">
      <Button
        variant="pink"
        onClick={fetchImagesData}
        disabled={loading}
        className="w-100"
      >
        Filter
      </Button>
    </Col>
  </>
);

export default DateFilter;