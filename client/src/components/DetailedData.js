import React, { useEffect, useState } from "react";
import { Spinner, Container, Card, Alert, Button, Modal, Row, Col } from "react-bootstrap";
import {
  BsImage, BsExclamationCircle, BsCheckCircle, BsXCircle,
  BsEye, BsCalendar, BsPerson,
} from "react-icons/bs";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import "./Live.css"

const DetailedData = ({ storename }) => {
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageverified, setImageverified] = useState(null);
  const [showGallery, setShowGallery] = useState(false); // State for gallery modal
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // State for selected image index
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  storename = storename || localStorage.getItem("storename");

  const token = localStorage.getItem("token");
  let name = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      name = decodedToken.name;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }
  console.log(name, "get named")




  const fetchImagesData = async () => {
    if (!storename) {
      setError("Store name not found");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getimagesdata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storename, startDate, endDate }),
      });
      const data = await response.json();
      if (data.success) {
        setImagesData(data.data);
        console.log(data.data)
      } else {
        setError("No data found for this store");
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchImagesData();
  }, [storename]);

  const handleImageAcceptAll = async (status) => {
    if (!status || !name) {
      setError("Status or name not provided");
      return;
    }
    console.log(name, 'name got');

    // Filter only images where both `image_verified` and `verified_by` are NULL
    const filteredImageIds = imagesData
      .filter(image => image.image_verified === null && image.verified_by === null)
      .map(image => image.id);

    if (filteredImageIds.length === 0) {
      setError("No eligible images to verify");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/imageverify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: filteredImageIds, status, name }), // Send only filtered IDs
      });

      const result = await response.json();
      if (result.success) {
        setImageverified(result.data);

        // Update local state for only the filtered images
        setImagesData(prevData =>
          prevData.map(image =>
            filteredImageIds.includes(image.id)
              ? { ...image, image_verified: status, verified_by: name }
              : image
          )
        );
      } else {
        setError("Failed to verify images");
      }
    } catch (err) {
      console.error("Error during fetch:", err.message);
      setError("Error verifying images");
    } finally {
      setLoading(false);
    }
  };


  const handleImageAccept = async (id, status) => {
    if (!id || !status || !name) {
      setError("Data not sent correctly");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/imageverify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, name }),
      });
      const result = await response.json();

      if (result.success) {
        setImageverified(result.data); // Assuming this sets the image verification status

        // Update both `image_verified` and `verified_by` fields in state
        setImagesData(prevData =>
          prevData.map(image =>
            image.id === id
              ? {
                ...image,
                image_verified: status,
                verified_by: image.image_verified ? name : name, // Update the `verified_by` field as well
              }
              : image
          )
        );
      } else {
        setError("Failed to verify image");
      }
    } catch (err) {
      console.error("Error during fetch:", err.message);
      setError("Error verifying image");
    } finally {
      setLoading(false);
    }
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

  const handleOpenGallery = (index) => {
    setSelectedImageIndex(index); // Set the index of the selected image
    setShowGallery(true);
  };
  const handleOpenFullGallery = () => {
    setShowAllGallery(true);
  }



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
          {/* Header */}
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold">#{index + 1}</h6>
            <small className="text-muted d-flex align-items-center">
              <BsCalendar className="me-1" />
              {new Date(image.createdat).toLocaleString()}
            </small>
          </div>

          {/* Key-Value Pairs */}
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

          {/* Button to view image */}
          <div className="d-flex mb-3">
            <Button
              variant="outline-pink"
              size="sm"
              onClick={() => handleOpenGallery(index)} // Pass the correct index
              className="w-100"
            >
              <BsEye className="me-2" />
              View Image
            </Button>
          </div>

          {/* Accept/Reject Buttons */}
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


  return (
    <Container fluid className="py-4 bg-light">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm mb-4">
          <Card.Body>

            <Row xs={12} className="d-flex align-items-start text-center mb-md-3 ">
              {/* Store Images Title */}
              <Col xs={12} md={10}>
                <h3 className=" text-start fw-bold mb-0" style={{ color: '#FF69B4' }}>
                  <BsImage className="me-2" />
                  Store Images - {storename}
                </h3>
              </Col>

              {/* Today's Data with Live Indicator */}
              <Col xs={12} md={2} className="text-end text-xs-start mt-3 mt-md-0">
              <h5 className="mb-0 d-flex align-items-center justify-content-end">
                    <span className=" me-2 live-indicator"></span>
                        <span className="me-2 fw-bold text-danger"> Dafault Todays Data</span>
                         {/* Live indicator */}
                    </h5>
              </Col>

            </Row>
            <Row className="d-flex align-items-center mb-2">
              {/* Date Filters */}
              <Col xs={12} md={2} lg={3} className=" mt-3 d-flex align-items-center mb-2 mb-md-0">
                <label htmlFor="startDate" className=" text-success form-label fw-bolder me-2 mb-0">StartDate:</label>
                <input
                  type="date"
                  id="startDate"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col xs={12} md={2} lg={2} className="  mt-3  d-flex align-items-center mb-2 mb-md-0">
                <label htmlFor="endDate" className="form-label fw-bolder text-success me-2 mb-0">EndDate:</label>
                <input
                  type="date"
                  id="endDate"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col xs={12} md={2} lg={1} className="  mt-3  mb-2 mb-md-0">
                <Button
                  variant="pink"
                  onClick={fetchImagesData}
                  disabled={loading}
                  className="w-100"
                >
                  Filter
                </Button>
              </Col>

              {/* Title */}


              {/* Action Buttons */}
              <Col xs={12} md={2} lg={3} className=" ms-auto d-flex justify-content-center gap-2 mb-2 mb-md-0 mt-4">
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
            </Row>



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
                    <table className="table table-hover align-middle">
                      <thead className="bg-light">
                        <tr className="text-center">
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>SINO</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Question</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Question Type</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>NTID</th>
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Image</th>
                          {/* {imagesData.some((image) => image.image_verified) && ( */}
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Previous Status</th>
                          {/* )} */}
                          {/* {imagesData.some((image) => image.verified_by) && ( */}
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Verified By</th>
                          {/* )} */}
                          <th className="text-white" style={{ backgroundColor: '#E10174' }}>Verify</th>
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
                                  onClick={() => handleOpenGallery(index)} // Pass the correct index
                                >
                                  <BsEye className="me-2" />
                                  View Image
                                </Button>
                              </td>
                              {image.image_verified ?
                                <td>{getStatusBadge(image.image_verified)}</td> :
                                <td>
                                  <span className="badge bg-info bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">Not Yet</span></td>}
                              {image.verified_by ? (
                                <td>
                                  <span className="badge bg-success bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">
                                    <BsPerson className="me-2" />
                                    {image.verified_by}
                                  </span>
                                </td>
                              ) : <td >
                                <span className="badge bg-info bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">Not Yet</span></td>}

                              <td>

                                <div className="d-flex gap-2 justify-content-center">
                                  {image.verified_by !== name ? (<><Button
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
                                    </Button></>) : <span className="badge bg-success bg-opacity-75 fs-6 p-2 rounded-5 text-white fw-bolder">
                                    <BsCheckCircle className="me-2" /> Done</span>}
                                </div>

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

      <Modal show={showAllGallery} onHide={() => setShowAllGallery(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">All Store Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Debugging: Log all images data */}
          {console.log("All Images Data:", imagesData)}

          {imagesData ? (
            (() => {
              // Extract all signedUrls from all store entries
              const allSignedUrls = Object.values(imagesData).flatMap(
                (store) => store?.signedUrls || []
              );

              return allSignedUrls.length > 0 ? (
                <div
                  className="d-flex flex-wrap gap-2 justify-content-center p-2"
                  style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                  {allSignedUrls.map((url, index) => (
                    <div
                      key={index}
                      className="p-1 shadow-sm rounded bg-light"
                      style={{ width: "100%", maxWidth: "320px" }}
                    >
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="img-fluid rounded border border-2 border-success"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(url, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted">No images available</p>
              );
            })()
          ) : (
            <p className="text-center text-muted">No images available</p>
          )}
        </Modal.Body>
      </Modal>




      {/* Image Gallery Modal */}
      <Modal
        show={showGallery}
        onHide={() => setShowGallery(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Store Images</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Debugging: Log the selected image data */}
          {console.log("Selected Image Data:", imagesData[selectedImageIndex])}

          {/* Check if imagesData is available and signedUrls exist */}
          {imagesData[selectedImageIndex]?.signedUrls?.length > 0 ? (
            <div
              className="d-flex flex-wrap gap-2 justify-content-center p-2"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {imagesData[selectedImageIndex].signedUrls.map((url, index) => (
                <div
                  key={index}
                  className="p-1 shadow-sm rounded bg-light"
                  style={{ width: "100%", maxWidth: "320px" }}
                >
                  <img
                    src={url}
                    alt={`Profile ${index + 1}`}
                    className="img-fluid rounded border border-2 border-success"
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={() => window.open(url, "_blank")}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No images available</p>
          )}
        </Modal.Body>
      </Modal>


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
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </Container>
  );
};

export default DetailedData;