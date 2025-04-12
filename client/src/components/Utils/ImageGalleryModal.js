import React from 'react';
import { Modal } from 'react-bootstrap';

const ImageGalleryModal = ({ show, onHide, title, imagesData, selectedImageIndex, isFullGallery }) => {
  const renderImages = () => {
    if (isFullGallery) {
      const allSignedUrls = imagesData.flatMap(store => store?.signedUrls || []);
      return allSignedUrls.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 justify-content-center p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {allSignedUrls.map((url, index) => (
            <div key={index} className="p-1 shadow-sm rounded bg-light" style={{ width: '100%', maxWidth: '320px' }}>
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="img-fluid rounded border border-2 border-success"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => window.open(url, '_blank')}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No images available</p>
      );
    } else {
      const signedUrls = imagesData[selectedImageIndex]?.signedUrls || [];
      return signedUrls.length > 0 ? (
        <div className="d-flex flex-wrap gap-2 justify-content-center p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {signedUrls.map((url, index) => (
            <div key={index} className="p-1 shadow-sm rounded bg-light" style={{ width: '100%', maxWidth: '320px' }}>
              <img
                src={url}
                alt={`Profile ${index + 1}`}
                className="img-fluid rounded border border-2 border-success"
                style={{ width: '100%', height: 'auto', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => window.open(url, '_blank')}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No images available</p>
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderImages()}</Modal.Body>
    </Modal>
  );
};

export default ImageGalleryModal;