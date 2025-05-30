import React, { useState } from 'react';
import { FaCloudUploadAlt, FaFile, FaCheckCircle } from 'react-icons/fa';
import Lottie from 'lottie-react';
import Animation from './AnnimatedJsons/store.json';

function MarketStructure() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(event) {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');

    const url = `${process.env.REACT_APP_BASE_URL}/marketstructureFile`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.message || 'Failed to upload file.');
      }

      console.log(data);
      setSuccess(data.message || 'File uploaded successfully!');
      setFile(null);
      event.target.reset();
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Header Section */}
      <div
        className="ms-2 rounded me-2 mb-1"
        style={{
          backgroundImage: 'url(/store.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '150px',
          width: '99.5%',
          opacity: '0.9',
        }}
      >
        <h4 className="text-white mb-1 fs-1 text-center pt-5">
          Market Structure
        </h4>
      </div>

      {/* Main Content Section */}
      <div
        className="p-3 d-flex flex-column flex-md-row align-items-center justify-content-center gap-5"
        style={{
          background:
            'linear-gradient(135deg, rgb(229, 237, 248) 0%, rgba(213, 245, 246, 0.32) 50%, rgba(248, 223, 241, 0.83) 100%)',
        }}
      >
        {/* Lottie Animation */}
        <div className="col-lg-3 col-md-4 d-none d-md-flex justify-content-center align-items-center mb-4 mb-md-0">
          <Lottie
            className="mb-3"
            autoplay
            loop
            animationData={Animation}
            style={{ height: '100%', width: '100%' }}
          />
        </div>

        {/* Upload Card */}
        <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body p-4">
            <div className="text-center mb-1">
              <div className="display-6 text-primary mb-1">
                <FaCloudUploadAlt size={50} />
              </div>
              <h2 className="fw-bold mb-1">Market Structure File Upload</h2>
              <p className="text-muted">Upload your CSV file here</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center animate__animated animate__shake" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="alert alert-success d-flex align-items-center animate__animated animate__fadeIn" role="alert">
                <FaCheckCircle className="me-2" />
                {success}
              </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit}>
              <div className="upload-box position-relative mb-2 p-2 rounded-3 border-2 border-primary border-dashed bg-light text-center">
                <input
                  type="file"
                  accept=".csv"
                  className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
                  onChange={handleChange}
                  required
                />
                {file ? (
                  <div className="text-success">
                    <FaFile className="me-2" size={20} />
                    <span className="fw-semibold">{file.name}</span>
                  </div>
                ) : (
                  <div className="text-muted">
                    <FaCloudUploadAlt size={30} className="mb-2" />
                    <p className="mb-0">Drag and drop your CSV file here or click to browse</p>
                    <small>Supported format: CSV</small>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-3 shadow-sm"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCloudUploadAlt className="me-2" />
                    Upload File
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .border-dashed {
          border-style: dashed !important;
        }
        .upload-box {
          transition: all 0.3s ease;
        }
        .upload-box:hover {
          background-color: rgba(13, 110, 253, 0.05) !important;
          cursor: pointer;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .animate__animated {
          animation-duration: 0.5s;
        }
        .animate__shake {
          animation-name: shake;
        }
        .animate__fadeIn {
          animation-name: fadeIn;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default MarketStructure;