import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { BsCalendar, BsPerson, BsEye, BsCheckCircle, BsXCircle } from 'react-icons/bs';
import { motion } from 'framer-motion';

const ImageCard = ({ image, index, handleOpenGallery, handleImageAccept, name, getStatusBadge }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="mb-3"
  >
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="mb-2 d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">{index + 1}</h6>
          <small className="text-muted d-flex align-items-center">
            <BsCalendar className="me-1" />
            {new Date(image.createdat).toLocaleString()}
          </small>
        </div>
        <div className="mb-2 d-flex">
          <strong className="text-muted">Question:</strong>
          <p className="mb-1 ms-2">{image.Question}</p>
        </div>
        <div className="mb-2 d-flex">
          <strong className="text-muted">Type:</strong>
          <p className="mb-1 ms-2">{image.type === 'Daily Question' ? image.checklistType : image.type}</p>
        </div>
        {image.image_verified && (
          <div className="mb-2 d-flex">
            <strong className="text-muted">Previous Status:</strong>
            <p className="mb-1 ms-2">{getStatusBadge(image.image_verified)}</p>
          </div>
        )}
        {image.verified_by && (
          <div className="mb-2 d-flex">
            <strong className="text-muted">Verified By:</strong>
            <p className="mb-1 ms-2 d-flex align-items-center">
              <BsPerson className="me-2" />
              {image.verified_by}
            </p>
          </div>
        )}
        <div className="mb-2 d-flex">
          <strong className="text-muted">NTID:</strong>
          <p className="mb-1 ms-2 d-flex align-items-center">
            <BsPerson className="me-2" />
            {image.ntid}
          </p>
        </div>
        <div className="d-flex mb-3">
          <Button
            variant="outline-pink"
            size="sm"
            onClick={() => handleOpenGallery(index)}
            className="w-100"
          >
            <BsEye className="me-2" />
            View Image
          </Button>
        </div>
        <div className="d-flex gap-2 justify-content-center">
          {image.verified_by !== name ? (
            <>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => handleImageAccept(image.id, 'yes')}
              >
                <BsCheckCircle className="me-2" />
                Accept
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleImageAccept(image.id, 'no')}
              >
                <BsXCircle className="me-2" />
                Reject
              </Button>
            </>
          ) : (
            <div className="badge bg-success bg-opacity-75 w-100 fs-6 p-2 rounded-5 text-white fw-bolder">
              <BsCheckCircle className="me-2" /> Done
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

export default ImageCard;