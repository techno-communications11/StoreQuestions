import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap"; // Bootstrap spinner
import { FaImage, FaExclamationCircle } from "react-icons/fa"; // React Icons
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS

const DetailedData = ({ storename }) => {
  const [imagesData, setImagesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  storename = storename || localStorage.getItem("storename");

  console.log(storename, "store");

  useEffect(() => {
    const fetchImagesData = async () => {
      if (!storename) {
        setError("Store name not found");
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getimagesdata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ storename }),
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

    fetchImagesData();
  }, [storename]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">
        <FaImage className="me-2" />
        Store Images
      </h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationCircle className="me-2" />
          {error}
        </div>
      )}

      {!loading && !error && imagesData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>SINO</th>
                <th>Question</th>
                <th>NTID</th>
                <th>Image URL</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {imagesData.map((image, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{image.Question}</td>
                  <td>{image.ntid}</td>
                 
                  <td>
                    <a href={image.signedUrl} target="_blank" rel="noopener noreferrer">
                      View Image
                    </a>
                  </td>
                  <td>{new Date(image.createdat).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && imagesData.length === 0 && (
        <div className="alert alert-info text-center" role="alert">
          No images found for this store.
        </div>
      )}
    </div>
  );
};

export default DetailedData;