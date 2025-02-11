import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaCamera,
  FaSpinner,
} from 'react-icons/fa'; // Importing React Icons

const Questions = () => {
  const [stores, setStores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [rowStates, setRowStates] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null); // Using useRef for file input

  const getStores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/questions`);
      if (response.status !== 200) {
        throw new Error('Failed to fetch stores');
      } else {
        const data = await response.json();
        setStores(data);
         console.log(data)
        // Initialize row states
        const initialState = data.reduce((acc, store) => {
          acc[store.question] = { checked: false, file: null };
          return acc;
        }, {});
        setRowStates(initialState);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  const handleLogin = (storename) => {
    setSelectedStore(storename);
    setOpenModal(true);
  };

  const handleValidate = async () => {
    const selectedRowState = rowStates[selectedStore];
    if (!selectedRowState.file) {
      setErrorMessage('Please select a file to upload');
      return;
    }
    const ntid = localStorage.getItem('ntid');
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found');
      return;
    }
    const decodedToken = jwtDecode(token); // Decode the token properly
    const id = decodedToken.id; // Get the ID from the decoded token
    const formData = new FormData();
    formData.append('file', selectedRowState.file);
    formData.append('question', selectedStore);
    formData.append('id', id);
    formData.append('ntid', ntid);

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/uploadimage`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSuccessMessage('File Uploaded Successfully');
        setOpenModal(false);
        setRowStates((prevState) => ({
          ...prevState,
          [selectedStore]: { checked: false, file: null },
        }));
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Failed to upload file.');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMessage('');
    setSuccessMessage(''); // Clear success message as well
  };

  const handleCheckboxChange = (storename) => (e) => {
    setRowStates((prevState) => ({
      ...prevState,
      [storename]: { ...prevState[storename], checked: e.target.checked },
    }));
  };

  const handleFileChange = (e) => {
    setRowStates((prevState) => ({
      ...prevState,
      [selectedStore]: { ...prevState[selectedStore], file: e.target.files[0] },
    }));
  };

  const handleCaptureImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="container-fluid mt-5">
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success text-center" role="alert">
          <FaCheckCircle className="me-2" />
          {successMessage}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="alert alert-danger text-center" role="alert">
          <FaTimesCircle className="me-2" />
          {errorMessage}
          <button
            type="button"
            className="btn-close float-end"
            onClick={() => setErrorMessage('')}
          ></button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center mt-5">
          <FaSpinner className="spinner-border text-primary" />
          <span className="ms-2">Loading...</span>
        </div>
      ) : (
        <>
          <h1 className="text-center fw-bolder mb-4" style={{color:'#E10174'}}>Daily Check List</h1>

          {/* Table */}
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr >
                <th  className='text-white' style={{backgroundColor:'#E10174'}}>Question</th>
                <th className='text-white' style={{backgroundColor:'#E10174'}}>Check</th>
                <th  className='text-white' style={{backgroundColor:'#E10174'}}>Validate</th>
              </tr>
            </thead>
            <tbody>
              {stores.length > 0 ? (
                stores.filter((store) => store.type === 'Daily Question').map((store, index) => (
                  <tr key={index}>
                    <td>{store.question?.toLowerCase()}</td>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={rowStates[store.question]?.checked || false}
                          onChange={handleCheckboxChange(store.question)}
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleLogin(store.question)}
                        disabled={!rowStates[store.question]?.checked}
                      >
                        <FaUpload className="me-2" /> Upload
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No stores found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal */}
          {openModal && (
            <div className="modal  show d-block" tabIndex="-1" role="dialog">
              <div className="modal-dialog  modal-dialog-centered" role="document">
                <div className="modal-content shadow-lg">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">{selectedStore}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Select a file to upload:</p>
                    <input
                      type="file"
                      className="form-control mb-3"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <p className="text-center">Or</p>
                    <button
                      className="btn btn-secondary w-100"
                      onClick={handleCaptureImage}
                    >
                      <FaCamera className="me-2" /> Capture Image with Camera
                    </button>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleValidate}
                    >
                      <FaCheckCircle className="me-2" /> Upload
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Questions;
