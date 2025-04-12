import React from 'react';
import { FaUpload, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const ChecklistTable = ({ 
  items, 
  rowStates, 
  onCheckboxChange, 
  onOpenFileDialog,
  bulkUploadMode
}) => {
  return (
    <table className="table table-striped table-hover">
      <thead className="table-light">
        <tr>
          <th className='text-white' style={{ backgroundColor: '#E10174' }}>SINO</th>
          <th className='text-white' style={{ backgroundColor: '#E10174' }}>Question</th>
          {bulkUploadMode && <th className='text-white' style={{ backgroundColor: '#E10174' }}>Status</th>}
          <th className='text-white' style={{ backgroundColor: '#E10174' }}>Check</th>
          <th className='text-white' style={{ backgroundColor: '#E10174' }}>Files</th>
          <th className='text-white' style={{ backgroundColor: '#E10174' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item, index) => {
            const state = rowStates[item.question] || {};
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.question?.toLowerCase()}</td>
                
                {bulkUploadMode && (
                  <td>
                    {state.uploading ? (
                      <FaSpinner className="spinner-border spinner-border-sm text-primary" />
                    ) : state.uploaded ? (
                      <FaCheck className="text-success" />
                    ) : state.uploadError ? (
                      <FaTimes className="text-danger" />
                    ) : null}
                  </td>
                )}
                
                <td>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={state.checked || false}
                      onChange={onCheckboxChange(item.question)}
                      disabled={state.uploading}
                    />
                  </div>
                </td>
                
                <td>
                  {state.fileNames?.join(', ') || 'No files'}
                </td>
                
                <td>
                  <button
                    className={`btn btn-sm ${state.checked ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => onOpenFileDialog(item.question)}
                    disabled={!state.checked || state.uploading}
                  >
                    <FaUpload className="me-1" />
                    {state.fileNames?.length ? 'Change' : 'Add'}
                  </button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={bulkUploadMode ? 6 : 5} className="text-center">
              No items found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ChecklistTable;