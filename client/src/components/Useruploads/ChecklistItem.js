import React from 'react';
import { FaUpload, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const ChecklistItem = ({ 
  index, 
  question, 
  checked, 
  fileNames,
  uploading,
  uploaded,
  uploadError,
  onCheckboxChange, 
  onOpenFileDialog,
  bulkUploadMode
}) => {
  return (
    <div className="col-12 mb-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="card-title mb-0 text-gradient fw-bolder">Question {index + 1}</h6>
            <div className="d-flex align-items-center">
              {bulkUploadMode && (
                <div className="me-3">
                  {uploading ? (
                    <FaSpinner className="spinner-border spinner-border-sm text-primary" />
                  ) : uploaded ? (
                    <FaCheck className="text-success" />
                  ) : uploadError ? (
                    <FaTimes className="text-danger" />
                  ) : null}
                </div>
              )}
              <div className="form-check">
                <label className="fw-bolder text-success">Check</label>
                <input
                  className="form-check-input border-primary fw-bolder"
                  type="checkbox"
                  checked={checked}
                  onChange={onCheckboxChange}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
          
          <p className="card-text mb-3">
            <span className='text-gradient fw-bolder'>Q: </span>
            {question?.toLowerCase()}
          </p>
          
          {fileNames && fileNames.length > 0 && (
            <div className="mb-3">
              <small className="text-muted">Files: {fileNames.join(', ')}</small>
            </div>
          )}

          <button
            className={`btn w-100 ${checked ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onOpenFileDialog(question)}
            disabled={!checked || uploading}
          >
            <FaUpload className="me-2" />
            {fileNames?.length ? 'Change Files' : 'Add Files'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;