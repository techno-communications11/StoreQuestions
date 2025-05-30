import { Upload } from 'lucide-react';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UploadModal = ({
  openModal,
  selectedItem,
  fileNames,
  uploading,
  successMessage,
  errorMessage,
  onCloseModal,
  onOpenFileDialog,
  onValidate,
  fileInputRef,
  onFileChange
}) => {
  if (!openModal) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header text-gradient text-white border-0 mt-2">
              <h5 className="modal-title fw-bold">{selectedItem}</h5>
              <button
                type="button"
                className="btn-close btn-close-dark mb-5"
                onClick={onCloseModal}
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
                  multiple
                  onChange={onFileChange}
                />

                {/* Success Message */}
                {successMessage && (
                  <div className="alert bg-success text-white text-center" role="alert">
                    <FaCheckCircle className="me-2" />
                    {successMessage}
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="alert alert-danger text-center" role="alert">
                    <FaTimesCircle className="me-2" />
                    {errorMessage}
                  </div>
                )}

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
                    onClick={() => onOpenFileDialog("file")}
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
                onClick={onValidate}
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
  );
};

export default UploadModal;