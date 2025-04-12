import React from 'react';
import { Card, Form, Button, Col } from 'react-bootstrap';
import { BsCalendarDate, BsFilterCircle } from 'react-icons/bs';

const DateFilter = ({ dateRange, setDateRange, fetchMarketData }) => (
  <Card className="shadow-sm mb-2">
    <Card.Header className="d-flex bg-white">
      <Col xs={4} md={10}>
        <h5 className="text-start mb-0">Date Filter</h5>
      </Col>
      <Col xs={8} md={2} className="text-end">
        <h5 className="mb-0 d-flex align-items-center justify-content-end">
          <span className="me-2 live-indicator"></span>
          <span className="me-2 fw-bold text-danger">Default Today's Data</span>
        </h5>
      </Col>
    </Card.Header>
    <Card.Body>
      <Form className="row g-3">
        <Col md={5}>
          <Form.Group>
            <Form.Label>
              <BsCalendarDate className="me-2" /> Start Date
            </Form.Label>
            <Form.Control
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border-pink"
            />
          </Form.Group>
        </Col>
        <Col md={5}>
          <Form.Group>
            <Form.Label>
              <BsCalendarDate className="me-2" /> End Date
            </Form.Label>
            <Form.Control
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border-pink"
            />
          </Form.Group>
        </Col>
        <Col md={2} className="d-flex align-items-end">
          <Button onClick={fetchMarketData} variant="pink" className="px-4 w-100">
            <BsFilterCircle className="me-2" /> Apply Filter
          </Button>
        </Col>
      </Form>
    </Card.Body>
  </Card>
);

export default DateFilter;