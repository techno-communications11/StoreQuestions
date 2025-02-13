import React, { useEffect, useState } from "react";
import { Spinner, Container, Card, Alert, Button } from "react-bootstrap";
import {
  BsImage, BsExclamationCircle, BsCheckCircle, BsXCircle,
  BsEye, BsCalendar, BsPerson
} from "react-icons/bs";
import { motion } from "framer-motion";

const DetailedData = ({ storename }) => {
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageverified, setImageverified] = useState(null);

  // ... keep all your existing fetch and handle functions the same ...
  storename = storename || localStorage.getItem("storename");
  useEffect(() => {
    const fetchImagesData = async () => {
      if (!storename) {
        setError("Store name not found");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getimagesdata`,
          {
            method: "POST", headers: { "Content-Type": "application/json", },

            body: JSON.stringify({ storename }),
          });
        const data = await response.json();
        if (data.success) {
          setImagesData(data.data);

        } else {
          setError("No data found for this store");
        }
      }
      catch (err) { setError("Error fetching data"); }
      finally { setLoading(false); }
    }; fetchImagesData();
  },
    [storename]);
    
  const handleImageAccept = async (id, status) => {
    if (!id || !status) {
      setError("Data not sent correctly");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/imageverify`,
        {
          method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({ id, status }),
        });
      const result = await response.json();
      if (result.success) {

        setImageverified(result.data);
        setImagesData(prevData => prevData.map(image => image.id === id ? { ...image, image_verified: status } : image));
      }
      else { setError("Failed to verify image"); }
    }
    catch (err) {
      console.error("Error during fetch:", err.message);
      setError("Error verifying image");
    }
    finally { setLoading(false); }
  };


  const getStatusBadge = (status) => {
    if (!status) return null;
    const isAccepted = status.toLowerCase() === 'yes';
    return (
      <span className={`badge-custom ${isAccepted ? 'badge-success' : 'badge-danger'}`}>
        {isAccepted ? (
          <><BsCheckCircle className="me-2" />Accepted</>
        ) : (
          <><BsXCircle className="me-2" />Rejected</>
        )}
      </span>
    );
  };

  const renderCard = (image, index) => (
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
            <h6 className="mb-0 fw-bold">#{index + 1}</h6>
            <small className="text-muted d-flex align-items-center">
              <BsCalendar className="me-1" />
              {new Date(image.createdat).toLocaleString()}
            </small>
          </div>

          <div className="mb-2">
            <strong className="text-muted">Question:</strong>
            <p className="mb-1">{image.Question}</p>
          </div>

          <div className="mb-2">
            <strong className="text-muted">Type:</strong>
            <p className="mb-1">{image.type === 'Daily Question' ? image.checklistType : image.type}</p>
          </div>

          <div className="mb-2">
            <strong className="text-muted">NTID:</strong>
            <p className="mb-1 d-flex align-items-center">
              <BsPerson className="me-2" />
              {image.ntid}
            </p>
          </div>

          <div className="mb-3">
            <Button
              variant="outline-pink"
              size="sm"
              as="a"
              href={image.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-100"
            >
              <BsEye className="me-2" />
              View Image
            </Button>
          </div>

          <div>
            {image.image_verified ? (
              getStatusBadge(image.image_verified)
            ) : (
              <div className="d-grid gap-2">
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
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );

  return (
    <Container fluid className="py-4 bg-light">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <h2 className="text-center fw-bold mb-4" style={{ color: '#FF69B4' }}>
              <BsImage className="me-2" />
              Store Images - {storename}
            </h2>

            {loading && (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: '#FF69B4' }} />
              </div>
            )}

            {error && (
              <Alert variant="danger" className="d-flex align-items-center">
                <BsExclamationCircle className="me-2" />
                {error}
              </Alert>
            )}

            {!loading && !error && imagesData.length > 0 && (
              <>
                {/* Table view for larger screens */}
                <div className="d-none d-md-block">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="table-responsive"
                  >
                    {/* Your existing table code */}
                    <table className="table table-hover align-middle">
                      <thead className="bg-light">
                        <tr className="text-center">
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>SINO</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Question</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Question Type</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>NTID</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Image</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Status</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imagesData
                          .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
                          .map((image, index) => (
                            <motion.tr
                              className="text-center"
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <td>{index + 1}</td>
                              <td>{image.Question}</td>
                              <td>{image.type === 'Daily Question' ? image.checklistType : image.type}</td>
                              <td>
                                <span className="d-flex justify-content-center align-items-center">
                                  <BsPerson className="me-2" />
                                  {image.ntid}
                                </span>
                              </td>
                              <td>
                                <Button
                                  variant="outline-pink"
                                  size="sm"
                                  as="a"
                                  href={image.signedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <BsEye className="me-2" />
                                  View Image
                                </Button>
                              </td>
                              <td>
                                {image.image_verified ? (
                                  getStatusBadge(image.image_verified)
                                ) : (
                                  <div className="d-flex gap-2 justify-content-center">
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
                                  </div>
                                )}
                              </td>
                              <td>
                                <span className="d-flex justify-content-center align-items-center text-muted">
                                  <BsCalendar className="me-2" />
                                  {new Date(image.createdat).toLocaleString()}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                      </tbody>
                    </table>
                  </motion.div>
                </div>

                {/* Card view for mobile screens */}
                <div className="d-md-none">
                  <div className="row row-cols-1 g-3">
                    {imagesData
                      .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
                      .map((image, index) => renderCard(image, index))}
                  </div>
                </div>
              </>
            )}

            {!loading && !error && imagesData.length === 0 && (
              <Alert variant="info" className="text-center">
                No images found for this store.
              </Alert>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      <style jsx>{`
        .btn-outline-pink {
          color: #FF69B4;
          border-color: #FF69B4;
        }
        .btn-outline-pink:hover {
          color: white;
          background-color: #FF69B4;
        }
        .badge-custom {
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          font-size: 0.9rem;
        }
        .badge-success {
          background-color: #d4edda;
          color: #155724;
        }
        .badge-danger {
          background-color: #f8d7da;
          color: #721c24;
        }
        .table-hover tbody tr:hover {
          background-color: rgba(255, 105, 180, 0.05);
        }
      `}</style>
    </Container>
  );
};

export default DetailedData;