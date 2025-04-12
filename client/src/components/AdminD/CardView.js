import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { BsArrowRightCircle, BsShop, BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';

const CardView = ({ filteredData, handleStoreSelection }) => (
  <div className="d-lg-none">
    <Row xs={1} md={2} className="g-2">
      {filteredData.map((store, index) => (
        <Col key={store.storename}>
          <Card
            className="h-100 shadow cursor-pointer"
            onClick={() => handleStoreSelection(store.storename)}
          >
            <Card.Header className="bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-success">#{index + 1}</span>
                <span className="text-pink fw-bold">
                  <BsArrowRightCircle className="me-2" />
                  {store.market}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h5 className="text-primary mb-0">
                  <BsShop className="me-2" />
                  {store.storename}
                </h5>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-success">
                  <BsCheckCircleFill className="me-2" />
                  <span className="fw-bold">{store.completed_count}</span>
                  <div className="small">Completed</div>
                </div>
                <div className="text-danger">
                  <BsXCircleFill className="me-2" />
                  <span className="fw-bold">{store.not_completed_count}</span>
                  <div className="small">Not Completed</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

export default CardView;