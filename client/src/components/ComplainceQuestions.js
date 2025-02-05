import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const ComplainceQuestions = () => {
    const [stores, setStores] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    const [file, setFile] = useState(null);
    const [checked, setChecked] = useState(false);

    const getStores = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/questions`);
            if (response.status !== 200) {
                throw new Error('Failed to fetch stores');
            } else {
                const data = await response.json();
                setStores(data);
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
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
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('question', selectedStore);

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('File uploaded successfully!');
                setOpenModal(false);
                setFile(null);
                setChecked(false);
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file.');
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center">Complaince Check List</h1>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
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
                                            checked={checked}
                                            onChange={(e) => setChecked(e.target.checked)}
                                        />
                                    </td>
                                    <td>
                                        <button className='btn btn-success' onClick={() => handleLogin(store.question)}>
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

            {openModal && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                    <div className="modal-dialog" role="document">
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
                                    className="form-control"
                                    onChange={(e) => setFile(e.target.files[0])}
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
                                    disabled={!checked || !file}
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

export default ComplainceQuestions;