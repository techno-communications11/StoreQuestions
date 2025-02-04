import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa'; // Import React Icons
import './Home.css'; // Custom CSS for animations and fixed header

const Home = () => {
    const [stores, setStores] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedStore, setSelectedStore] = useState('');
    const [ntid, setNtid] = useState('');
    const navigate = useNavigate();

    const getStores = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/stores`); // Call the backend API
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
         if(ntid.length>=8){
            navigate('/questions');
         }else{
            alert('error')
         }
        
        setOpenModal(false);
        setNtid(''); // Clear NTID after submission
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4 text-center text-primary">Stores</h1>
            <div className="table-responsive fixed-header-table">
                <table className="table table-striped table-bordered">
                    <thead className="thead-dark">
                        <tr className='text-center'>
                            <th>SINO</th>
                            <th>Store Name</th>
                            <th>Enter</th>
                        </tr>
                    </thead>
                    <tbody className='text-center'>
                        {stores.length > 0 ? (
                            stores.map((store, index) => (
                                <tr key={index} className="animate__animated animate__fadeIn">
                                    <td>{index+1}</td>
                                    <td className='text-capitalize'>{store.storename?.toLowerCase()}</td>
                                    <td>
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleLogin(store.storename)}
                                        >
                                            <FaSignInAlt /> Re-login
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
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Enter NTID for {selectedStore}</h5>
                                
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter NTID"
                                    value={ntid}
                                    onChange={(e) => setNtid(e.target.value)}
                                />
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleCloseModal}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleValidate}
                                >
                                    Validate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;