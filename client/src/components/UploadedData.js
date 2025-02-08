import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  FaImage,
  FaSpinner,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaUserCircle,
  FaQuestion
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadedData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  let id;
  if (token) {
    id = jwtDecode(token).id;
  }

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/uploadeddata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'No data found for this user');
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMarketData();
    } else {
      setError("User ID not found in token");
      setLoading(false);
    }
  }, [id]);

  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <FaSpinner className="spinner-border text-pink" style={{ color: '#FF69B4', width: '3rem', height: '3rem' }} />
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-4 d-flex align-items-center" role="alert">
      <FaExclamationTriangle className="me-2" />
      Error: {error}
    </div>
  );

  return (
    <div className="container-fluid py-2 px-1" style={{ backgroundColor: '#FFF5F7' }}>
      <div className="card shadow-lg border-0 rounded-lg" style={{ backgroundColor: 'white' }}>
        <div className="card-header bg-white border-bottom-0 pt-4">
          <div className="d-flex justify-content-center align-items-center flex-wrap">
            <h1 className="mb-3 mb-md-0" style={{ color: '#FF69B4' }}>
              <FaImage className="me-2" />
              Uploaded Data
            </h1>
          </div>
        </div>

        <div className="card-body" >
          {data.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: '520px', overflowY: 'auto' }}>
              <table className="table table-hover">
                <thead className="sticky-header ">
                  <tr className="text-center">
                    <th className="py-3">S.No</th>
                    <th className="py-3">
                      <FaUserCircle className="me-2" />
                      NTID
                    </th>
                    <th className="py-3">Status</th>
                    <th className="py-3">
                      <FaCalendarAlt className="me-2" />
                      Created At
                    </th>
                    <th className="py-3">
                      <FaQuestion className="me-2" />
                      Question
                    </th>
                    <th className="py-3">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
                    .map((item, index) => (
                      <tr key={item.id} className="text-center">
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3">{item.ntid}</td>
                        <td className="py-3">
                          {item.image_verified ? (
                            <FaCheck className="text-success" />
                          ) : (
                            <FaTimes className="text-danger" />
                          )}
                        </td>
                        <td className="py-3">
                          {new Date(item.createdat).toLocaleString()}
                        </td>
                        <td className="py-3">{item.question}</td>
                        <td className="py-3">
                          <button
                            className="btn btn-link p-0"
                            onClick={() => handleImageClick(item.signedUrl)}
                            title="View Image"
                          >
                            <FaImage
                              size={24}
                              style={{ color: '#FF69B4' }}
                              className="hover-scale"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FaExclamationTriangle size={48} className="text-muted mb-3" />
              <p className="h5 text-muted">No data available</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hover-scale:hover {
          transform: scale(1.2);
          transition: transform 0.2s ease-in-out;
        }
        .text-pink {
          color:#E10174;
        }
        .sticky-header th {
          position: sticky;
          top: 0;
          background-color:#E10174;
          color:white;
          z-index: 1;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner-border {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadedData;
