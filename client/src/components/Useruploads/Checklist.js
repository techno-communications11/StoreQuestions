import React, { useState, useEffect, useRef } from "react";
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUpload,
} from "react-icons/fa";
import ChecklistItem from "./ChecklistItem";
import ChecklistTable from "./ChecklistTable";

const Checklist = ({ title, filterCondition }) => {
  const [items, setItems] = useState([]);
  const [rowStates, setRowStates] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bulkUploadMode, setBulkUploadMode] = useState(false);
  const fileInputRef = useRef(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const getItems = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/questions`,
        {
          // credentials: 'include'
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch items");
      } else {
        const data = await response.json();
        setItems(data);
        const initialState = data.reduce((acc, item) => {
          acc[item.question] = {
            checked: false,
            files: [],
            fileNames: [],
            uploaded: false,
            uploadError: false,
            uploading: false,
          };
          return acc;
        }, {});
        setRowStates(initialState);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setErrorMessage("Failed to fetch items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  const handleOpenFileDialog = (question) => {
    if (rowStates[question]?.checked) {
      setCurrentQuestion(question);
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }, 0);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && currentQuestion) {
      setRowStates((prevState) => ({
        ...prevState,
        [currentQuestion]: {
          ...prevState[currentQuestion],
          files,
          fileNames: files.map((file) => file.name),
          uploaded: false,
          uploadError: false,
        },
      }));
    }
    e.target.value = "";
  };

  const handleCheckboxChange = (question) => (e) => {
    const isChecked = e.target.checked;
    setRowStates((prevState) => ({
      ...prevState,
      [question]: {
        ...prevState[question],
        checked: isChecked,
        // Clear files when unchecking
        files: isChecked ? prevState[question].files : [],
        fileNames: isChecked ? prevState[question].fileNames : [],
      },
    }));
  };

  const handleUploadSelected = async () => {
    const selectedItems = Object.entries(rowStates).filter(
      ([_, state]) => state.checked && state.files.length > 0
    );

    if (selectedItems.length === 0) {
      setErrorMessage("Please select at least one checked question with files");
      return;
    }

    const formData = new FormData();

    // Add all files
    selectedItems.forEach(([_, state]) => {
      state.files.forEach((file) => {
        formData.append("files", file);
      });
    });

    // Add metadata
    formData.append("ntid", localStorage.getItem("ntid"));
    formData.append("storeaddress", localStorage.getItem("selectedstore"));
    formData.append("browserTime", new Date().toISOString());

    // Add questions as comma-separated string
    const questions = selectedItems.map(([question]) => question);
    formData.append("questions", questions.join(","));

    setUploading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/uploadbulkimages`,
        {
          method: "POST",
          body: formData,
          // credentials:'include'
          // headers are automatically set by browser for FormData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccessMessage(
        `Successfully uploaded ${data.successfulUploads} files`
      );

      // Reset successfully uploaded items
      setRowStates((prev) => {
        const newState = { ...prev };
        selectedItems.forEach(([question]) => {
          newState[question] = {
            checked: false,
            files: [],
            fileNames: [],
          };
        });
        return newState;
      });
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const toggleBulkUploadMode = () => {
    setBulkUploadMode(!bulkUploadMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const filteredItems = items.filter(filterCondition);

  return (
    <div className="container-fluid mt-5">
      {/* Success/Error messages and loading spinner... */}
      {loading && (
        <div className="text-center my-4">
          <FaSpinner className="fa-spin me-2" size={24} />
          <span className="visi">Loading checklist items...</span>
        </div>
      )}
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <FaCheckCircle className="me-2" />
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      {errorMessage && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <FaTimesCircle className="me-2" />
          {errorMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setErrorMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {uploading && (
        <div className="text-center my-4">
          <FaSpinner className="fa-spin me-2" size={24} />
          <span>Uploading files...</span>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-center fw-bolder" style={{ color: "#E10174" }}>
          {title}
        </h1>
        <div>
          <button
            className={`btn ${
              bulkUploadMode ? "btn-danger" : "btn-primary"
            } me-2`}
            onClick={toggleBulkUploadMode}
          >
            {bulkUploadMode ? "Exit Bulk Mode" : "Bulk Upload Mode"}
          </button>
          {bulkUploadMode && (
            <button
              className="btn btn-success"
              onClick={handleUploadSelected}
              disabled={
                uploading ||
                !Object.values(rowStates).some(
                  (s) => s.checked && s.files.length > 0
                )
              }
            >
              <FaUpload className="me-2" />
              Upload Selected
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="d-none"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />

      <div className="d-none d-md-block">
        <ChecklistTable
          items={filteredItems}
          rowStates={rowStates}
          onCheckboxChange={handleCheckboxChange}
          onOpenFileDialog={handleOpenFileDialog}
          bulkUploadMode={bulkUploadMode}
        />
      </div>

      <div className="d-md-none">
        <div className="row">
          {filteredItems.map((item, index) => (
            <ChecklistItem
              key={index}
              index={index}
              question={item.question}
              checked={rowStates[item.question]?.checked || false}
              fileNames={rowStates[item.question]?.fileNames || []}
              uploading={rowStates[item.question]?.uploading || false}
              uploaded={rowStates[item.question]?.uploaded || false}
              uploadError={rowStates[item.question]?.uploadError || false}
              onCheckboxChange={handleCheckboxChange(item.question)}
              onOpenFileDialog={() => handleOpenFileDialog(item.question)}
              bulkUploadMode={bulkUploadMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Checklist;
