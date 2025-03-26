import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Camera, Upload, X } from 'lucide-react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
  FaSpinner,
} from 'react-icons/fa';

const Morning = () => {
  const [stores, setStores] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState('');
  const [rowStates, setRowStates] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileNames, setFileNames] = useState([]); // State to store file names
  const fileInputRef = useRef(null);
  const [captureMode, setCaptureMode] = useState(null); // 'camera' or 'file'

  const getStores = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/questions`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      const data = await response.json();
      setStores(data);
      const initialState = data.reduce((acc, store) => {
        acc[store.question] = { checked: false, files: [] }; // Store files as an array
        return acc;
      }, {});
      setRowStates(initialState);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setErrorMessage('Failed to fetch stores. Please try again later.');
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
    if (!selectedRowState.files || selectedRowState.files.length === 0) {
      setErrorMessage('Please select at least one file to upload');
      return;
    }

    const ntid = localStorage.getItem('ntid');
    const selectedstore = localStorage.getItem('selectedstore');

    const formData = new FormData();
    // const now = new Date();
    // const offset = -6 * 60; // CST is UTC-6
    // const cstTime = new Date(now.getTime() + offset * 60 * 1000)
    //   .toISOString()
    //   .slice(0, 19) // Remove milliseconds
    //   .replace("T", " ");   
    const now = new Date();
    const browserTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/, '$3-$1-$2 $4:$5:$6');
      
      selectedRowState.files.forEach((file, index) => {
      formData.append('files', file); // Append each file
    });
    formData.append('question', selectedStore);
    formData.append('ntid', ntid);
    formData.append('storeaddress', selectedstore);
    formData.append('browserTime', browserTime);
    // formData.append("createdat", cstTime);


    setUploading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/uploadimage`, { // Update endpoint to handle multiple files
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setSuccessMessage('Files Uploaded Successfully');
        setOpenModal(false);
        setRowStates((prevState) => ({
          ...prevState,
          [selectedStore]: { checked: false, files: [] }, // Clear files
        }));
        setFileNames([]); // Clear file names
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Clear file input
        }
      } else {
        throw new Error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrorMessage('Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenFileDialog = (mode) => {
    setCaptureMode(mode); 
    if (mode === "file") {
      fileInputRef.current?.click();
    } else if (mode === "camera") {
      fileInputRef.current?.click();
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setErrorMessage('');
    setSuccessMessage('');
    setFileNames([]); // Clear file names
    setCaptureMode('');
    fileInputRef.current = null;
  };

  const handleCheckboxChange = (storename) => (e) => {
    setRowStates((prevState) => ({
      ...prevState,
      [storename]: { ...prevState[storename], checked: e.target.checked },
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Convert FileList to array
    if (files.length > 0) {
      setRowStates((prevState) => ({
        ...prevState,
        [selectedStore]: { ...prevState[selectedStore], files },
      }));
      setFileNames(files.map((file) => file.name)); // Set file names
    }
  };

  const renderCard = (store, index) => (
    <div className="col-12 mb-3" key={index}>
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="card-title mb-0 text-gradient fw-bolder">Question {index + 1}</h6>
            <div className="form-check">
              <label className="fw-bolder text-success">Check</label>
              <input
                className="form-check-input border-primary fw-bolder"
                type="checkbox"
                checked={rowStates[store.question]?.checked || false}
                onChange={handleCheckboxChange(store.question)}
              />
            </div>
          </div>
          <p className="card-text mb-3 "><span className='text-gradient fw-bolder'>Q: </span>{store.question?.toLowerCase()}</p>
          <button
            className="btn btn-primary w-100"
            onClick={() => handleLogin(store.question)}
            disabled={!rowStates[store.question]?.checked}
          >
            <FaUpload className="me-2" /> Upload
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid mt-5">
      {successMessage && (
        <div className="alert bg-success text-white text-center" role="alert">
          <FaCheckCircle className="me-2" />
          {successMessage}
          <button
            type="button"
            className="btn-close btn-close-white float-end"
            onClick={() => setSuccessMessage('')}
          ></button>
        </div>
      )}

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

      {loading ? (
        <div className="text-center mt-5">
          <FaSpinner className="spinner-border text-primary" />
          <span className="ms-2">Loading...</span>
        </div>
      ) : (
        <>
          <h1 className="text-center mb-4 fw-bolder" style={{ color: '#E10174' }}>Morning Check List</h1>

          <div className="d-none d-md-block">
            <table className="table table-striped table-hover">
              <thead className="table-light">
                <tr>
                  <th className='text-white' style={{ backgroundColor: '#E10174' }}>SINO</th>
                  <th className='text-white' style={{ backgroundColor: '#E10174' }}>Question</th>
                  <th className='text-white' style={{ backgroundColor: '#E10174' }}>Check</th>
                  <th className='text-white' style={{ backgroundColor: '#E10174' }}>Validate</th>
                </tr>
              </thead>
              <tbody>
                {stores.length > 0 ? (
                  stores.filter((store) => store.checklistType === 'Morning Question' && store.isEnabled===1).map((store, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
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
                    <td colSpan="4" className="text-center">
                      No stores found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-md-none">
            <div className="row">
              {stores.length > 0 ? (
                stores
                  .filter((store) => store.checklistType === 'Morning Question')
                  .map((store, index) => renderCard(store, index))
              ) : (
                <div className="col-12">
                  <div className="alert alert-info text-center">
                    No stores found
                  </div>
                </div>
              )}
            </div>
          </div>

          {openModal && (
            <>
              <div className="modal-backdrop show"></div>
              <div className="modal show d-block" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header text-gradient text-white border-0 mt-2">
                      <h5 className="modal-title fw-bold">{selectedStore}</h5>
                      <button
                        type="button"
                        className="btn-close btn-close-dark mb-5"
                        onClick={handleCloseModal}
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body p-2">
                      <div className="d-grid gap-3">
                        {/* Hidden File Input */}
                        <input
                          type="file"
                          className="d-none"
                          ref={fileInputRef}
                          accept="image/*"
                          capture="environment"
                          multiple // Allow multiple files
                          onChange={handleFileChange}
                        />

                        {/* File Upload UI */}
                        <div className="upload-area p-2 border-2 rounded-3 text-center">
                          <Upload className="mb-2" size={82} />
                          {fileNames.length > 0 && (
                            <div className="mt-2">
                              <span className="text-muted">Selected Files: {fileNames.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Choose File or Use Camera */}
                        <div className="d-flex flex-column gap-2">
                          <button
                            className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                            onClick={() => handleOpenFileDialog("file")}
                          >
                            <Upload size={20} />
                            Choose Files
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer border-top">
                      <button
                        type="button"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={handleValidate}
                        disabled={uploading || fileNames.length === 0}
                      >
                        {uploading ? <FaSpinner className="spinner-border spinner-border-sm" /> : <Upload size={20} />}
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .text-gradient {
          background: linear-gradient(45deg, #E10174, #FF69B4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .card {
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-2px);
        }
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1040;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
};

export default Morning;