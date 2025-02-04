import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { useNavigate } from 'react-router-dom';
const Questions = () => {
    const [stores, setStores] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    const [ntid, setNtid] = useState('');
    //  const navigate=useNavigate();

    const getStores = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/questions`); // Call the backend API
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
        setSelectedStore(storename); // Store the selected store
        setOpenModal(true); // Open the modal
    };

    const handleValidate = () => {
        console.log('Validating NTID:', ntid, selectedStore);
        // Here you can implement the logic to validate the NTID
        // After validation, close the modal
        // navigate('/questions')
        setOpenModal(false);
        setNtid(''); // Clear NTID after submission
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Questions</h1>
            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>Question</th>
                            <th>Validate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.length > 0 ? (
                            stores.map((store, index) => (
                                <tr key={index}>
                                    <td className='text-capitalize'>{store.question?.toLowerCase()}</td>
                                    <td>
                                        <button className='btn btn-success' onClick={() => handleLogin(store.question)}>
                                            upload
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="2" className="text-center">No stores found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for NTID Validation */}
            {openModal && (
                <div className="modal show" style={{ display: 'block' }} role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedStore}</h5>
                                
                            </div>
                            <div className="modal-body">
                                <input
                                    type="file"
                                    className="form-control"
                                    placeholder="Enter NTID"
                                    value={ntid}
                                    onChange={(e) => setNtid(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                                    Close
                                </button>
                                <button type="button" className="btn btn-success" onClick={handleValidate}>
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
