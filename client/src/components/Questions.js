import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jwtDecode } from 'jwt-decode';

const Questions = () => {
    const [stores, setStores] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    const [rowStates, setRowStates] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const getStores = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/questions`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch stores');
            } else {
                const data = await response.json();
                setStores(data);
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

        console.log('FormData being sent:', formData); // Log form data to check what is being sent

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/uploadimage`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setSuccessMessage("File Uploaded Successfully");
                setOpenModal(false);
                setRowStates(prevState => ({
                    ...prevState,
                    [selectedStore]: { checked: false, file: null }
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
    };

    const handleCheckboxChange = (storename) => (e) => {
        setRowStates(prevState => ({
            ...prevState,
            [storename]: { ...prevState[storename], checked: e.target.checked }
        }));
    };

    const handleFileChange = (e) => {
        setRowStates(prevState => ({
            ...prevState,
            [selectedStore]: { ...prevState[selectedStore], file: e.target.files[0] }
        }));
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center">Daily Check List</h1>

            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>{successMessage}</strong>
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setSuccessMessage('')}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>{errorMessage}</strong>
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setErrorMessage('')}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}

            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Question</th>
                                <th>Check</th>
                                <th>Validate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.length > 0 ? (
                                stores.map((store, index) => (
                                    <tr key={index}>
                                        <td className='text-capitalize'>{store.question?.toLowerCase()}</td>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={rowStates[store.question]?.checked || false}
                                                onChange={handleCheckboxChange(store.question)}
                                                className="form-check-input"
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className='btn btn-success btn-sm'
                                                onClick={() => handleLogin(store.question)}
                                                disabled={!rowStates[store.question]?.checked}
                                            >
                                                Upload
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">No stores found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {openModal && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedStore}</h5>
                                <button type="button" className="close" onClick={handleCloseModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="file"
                                    className="form-control-file"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleValidate}
                                    disabled={!rowStates[selectedStore]?.file}
                                >
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Questions;