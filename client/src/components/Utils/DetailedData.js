import React, { useEffect, useState } from "react";
import { Container, Card, Alert, Spinner, Row, Col } from "react-bootstrap";
import { BsImage, BsExclamationCircle } from "react-icons/bs";
import { motion } from "framer-motion";
import { useUserContext } from "../Auth/UserContext";
import ImageCard from "./ImageCard";
import ImageTableRow from "./ImageTableRow";
import ImageGalleryModal from "./ImageGalleryModal";
import DateFilter from "./DateFilter";
import ActionButtons from "./ActionButtons";
import "./Styles/Live.css";

const DetailedData = () => {
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageverified, setImageverified] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  let { storename, userData } = useUserContext();
  const name = userData?.name || atob(localStorage.getItem("name")) || "Unknown User";


  const fetchImagesData = async () => {
    storename=atob(localStorage.getItem('storeName'));
    if (!storename) {
       
      setError("Store name not found");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/getimagesdata`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storename, startDate, endDate }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setImagesData(data.data);
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
    localStorage.setItem("storeName",btoa(storename));
  }, [storename]);

  const handleImageAcceptAll = async (status) => {
    if (!status || !name) {
      setError("Status or name not provided");
      return;
    }
    const filteredImageIds = imagesData
      .filter(
        (image) => image.image_verified === null && image.verified_by === null
      )
      .map((image) => image.id);

    if (filteredImageIds.length === 0) {
      setError("No eligible images to verify");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/imageverify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: filteredImageIds, status, name }),
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result.success) {
        setImageverified(result.data);
        setImagesData((prevData) =>
          prevData.map((image) =>
            filteredImageIds.includes(image.id)
              ? { ...image, image_verified: status, verified_by: name }
              : image
          )
        );
      } else {
        setError("Failed to verify images");
      }
    } catch (err) {
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
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/imageverify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status, name }),
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result.success) {
        setImageverified(result.data);
        setImagesData((prevData) =>
          prevData.map((image) =>
            image.id === id
              ? { ...image, image_verified: status, verified_by: name }
              : image
          )
        );
      } else {
        setError("Failed to verify image");
      }
    } catch (err) {
      setError("Error verifying image");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const isAccepted = status.toLowerCase() === "yes";
    return (
      <span
        className={`badge-custom ${
          isAccepted ? "badge-success" : "badge-danger"
        }`}
      >
        {isAccepted ? <>✔ Accepted</> : <>✖ Rejected</>}
      </span>
    );
  };

  const handleOpenGallery = (index) => {
    setSelectedImageIndex(index);
    setShowGallery(true);
  };

  const handleOpenFullGallery = () => {
    setShowAllGallery(true);
  };

  return (
    <Container fluid className="py-4 bg-light">
      {imageverified&&alert("image verified")}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row
              xs={12}
              className="d-flex align-items-start text-center mb-md-3"
            >
              <Col xs={12} md={10}>
                <h3
                  className="text-start fw-bold mb-0"
                  style={{ color: "#FF69B4" }}
                >
                  <BsImage className="me-2" />
                  Store Images - {storename}
                </h3>
              </Col>
              <Col
                xs={12}
                md={2}
                className="text-end text-xs-start mt-3 mt-md-0"
              >
                <h5 className="mb-0 d-flex align-items-center justify-content-end">
                  <span className="me-2 live-indicator"></span>
                  <span className="me-2 fw-bold text-danger">
                    Default Todays Data
                  </span>
                </h5>
              </Col>
            </Row>
            <Row className="d-flex align-items-center mb-2">
              <DateFilter
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                fetchImagesData={fetchImagesData}
                loading={loading}
              />
              <ActionButtons
                handleImageAcceptAll={handleImageAcceptAll}
                handleOpenFullGallery={handleOpenFullGallery}
              />
            </Row>

            {loading && (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: "#FF69B4" }} />
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
                <div className="d-none d-md-block">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="table-responsive"
                  >
                    <table className="table table-hover align-middle">
                      <thead className="bg-light">
                        <tr className="text-center text-nowrap">
                          {[
                            "SINO",
                            "Question",
                            "Question Type",
                            "NTID",
                            "Image",
                            "Previous Status",
                            "Verified By",
                            "Verify",
                            "Created At",
                          ].map((item, index) => (
                            <th
                              key={index}
                              className="text-white"
                              style={{ backgroundColor: "#E10174" }}
                            >
                              {item}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {imagesData
                          .sort(
                            (a, b) =>
                              new Date(b.createdat) - new Date(a.createdat)
                          )
                          .map((image, index) => (
                            <ImageTableRow
                              key={index}
                              image={image}
                              index={index}
                              handleOpenGallery={handleOpenGallery}
                              handleImageAccept={handleImageAccept}
                              name={name}
                              getStatusBadge={getStatusBadge}
                            />
                          ))}
                      </tbody>
                    </table>
                  </motion.div>
                </div>
                <div className="d-md-none">
                  <div className="row row-cols-1 g-3">
                    {imagesData
                      .sort(
                        (a, b) => new Date(b.createdat) - new Date(a.createdat)
                      )
                      .map((image, index) => (
                        <ImageCard
                          key={index}
                          image={image}
                          index={index}
                          handleOpenGallery={handleOpenGallery}
                          handleImageAccept={handleImageAccept}
                          name={name}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
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

      <ImageGalleryModal
        show={showGallery}
        onHide={() => setShowGallery(false)}
        title="Store Images"
        imagesData={imagesData}
        selectedImageIndex={selectedImageIndex}
        isFullGallery={false}
      />
      <ImageGalleryModal
        show={showAllGallery}
        onHide={() => setShowAllGallery(false)}
        title="All Store Images"
        imagesData={imagesData}
        selectedImageIndex={0}
        isFullGallery={true}
      />

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
орта display: inline-flex;
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
