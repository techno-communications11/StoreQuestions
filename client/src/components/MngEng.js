import React, { useState } from "react";
import { Container, Row, Col, Card, Modal, Button } from "react-bootstrap";
import { FaClipboardList, FaCheckCircle } from "react-icons/fa";
import "./UserHome.css";
import { useNavigate } from "react-router-dom";
import validatingNtid from './Validatingntid'
import { IoIosTime } from "react-icons/io";
import fetchStores from "./fetchStores";
import { useEffect } from "react";
import { useRef } from "react";
import { Form } from "react-bootstrap";

const MngEvg = ({ onverify }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [ntid, setNtid] = useState('');
    const [error, setError] = useState("")
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [isVerifying, setIsVerifying] = useState(false); // Track if the NTID is being verified
     const [stores, setStores] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [selectedStore, setSelectedStore] = useState('');
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef(null);

    useEffect(() => {
        const getStoresData = async () => {
            const data = await fetchStores();

            if (data.error) {
                setError(data.error);
            } else {
                setStores(data);
            }
        };

        getStoresData();
    }, []);

    const openModal = (type) => { //opening the modal
        setError(false) // setting error to default state
        setModalContent(type === "checklist" ? "Morning Check List" : "Evening Checklist List");
        setShowModal(true); //making true
    };

    const handleNtid = async () => {
    
        setIsVerifying(true); // Start verification process
    
        const name = await validatingNtid(selectedStore,ntid); // Await the function call
    
        // console.log(name, "Got name from validation");
    
        if (name) {
            setUsername(name.name); // Show name
            // Debugging log for onverify
            if (typeof onverify === 'function') {
                console.log("Calling onverify function...");
                onverify(); // Trigger verification callback
            } else {
                console.error("onverify is not a function or is undefined");
            }
    
            setTimeout(() => {
                setIsVerifying(false); // End verification process
                setTimeout(() => {
                    // Wait for a bit before navigating
                    if (modalContent === 'Morning Check List') {
                        navigate("/morning");
                    } else {
                        navigate("/questions");
                    }
                }, 2000); // 2 seconds delay for showing username
            }, 1000); // 1 second delay before showing the name
        } else {
            setError('Invalid NTID / Verification Failed')
            setIsVerifying(false); // End verification process if failed
        }
    };
    
   const handleStoreSelect = (store) => {
           setSelectedStore(store);
           setSearchTerm(store);
           setIsDropdownOpen(false);
       };
       const filteredStores = stores.filter((store) =>
        store.storeaddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
   
   
       useEffect(() => {
           const handleClickOutside = (event) => {
               if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                   setIsDropdownOpen(false);
               }
           };
   
           document.addEventListener("mousedown", handleClickOutside);
           return () => {
               document.removeEventListener("mousedown", handleClickOutside);
           };
       }, []);

    

    return (
        <div className="min-vh-100"  style={{
            background: "linear-gradient(135deg,rgb(239, 248, 229) 0%,rgba(213, 245, 246, 0.32) 50%,rgba(248, 223, 241, 0.83) 100%)",
          }}>
            <Container fluid className=" d-flex flex-column  p-4">
                {/* Header Section */}
                <div className="header-section text-center">
                    <h2 className="company-title display-3 fw-bold text-gradient mb-0">
                        Techno Communications LLC
                    </h2>
                    <div className="header-divider"></div>
                    <h3 className="section-title fw-bold">
                        Morning Check List & Evening Check List
                    </h3>
                </div>

                {/* Cards Section */}
                <Row className="justify-content-center align-items-stretch g-4 main-content">
                    {/* Daily Checklist Card */}
                    <Col md={6} lg={5}>
                        <Card className="feature-card  text-center border-0 mt-4">
                            <Card.Body className="d-flex flex-column align-items-center p-5">
                                <div className="icon-wrapper">
                                    <FaClipboardList className="feature-icon" />
                                </div>
                                <Card.Title className="fw-bold text-uppercase mt-3">
                                    Morning Check List
                                </Card.Title>
                                <Card.Text className="text-muted mb-4">
                                    Organize and track your daily Morning responsibilities efficiently.
                                    Stay on top of tasks with our comprehensive checklist system.
                                </Card.Text>
                                <button onClick={() => openModal("checklist")} className="btn btn-primary mt-auto fw-bold action-button">
                                    View Morning Check List
                                </button>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Compliance Checklist Card */}
                    <Col md={6} lg={5}>
                        <Card className="feature-card  text-center border-0 mt-4">
                            <Card.Body className="d-flex flex-column align-items-center p-5">
                                <div className="icon-wrapper">
                                    <FaCheckCircle className="feature-icon" />
                                </div>
                                <Card.Title className="fw-bold text-uppercase mt-3">
                                    Evening Check List
                                </Card.Title>
                                <Card.Text className="text-muted mb-4">
                                Organize and track your daily Evening responsibilities efficiently.
                                Stay on top of tasks with our comprehensive checklist system.
                                </Card.Text>
                                <button onClick={() => openModal("compliance")} className="btn btn-primary mt-auto fw-bold action-button">
                                    View Evening Check List
                                </button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Modal */}
            <Modal show={showModal} onHide={
                () =>
                 setShowModal(false)
                 } centered size="md">
                {username ?
                    <div className="text-center p-4">
                        <FaCheckCircle size={50} color="green" className="mb-3" /> {/* Verified Icon */}
                        <h4 className="fw-bold text-success">Verified</h4>
                        <p className="fw-semibold text-primary">{username}</p> {/* Styled Name */}
                        <h4 className="fw-bolder"><IoIosTime className="fs-1" /> Wait a movement ...</h4>
                    </div>
                    :
                    <Modal.Body className="text-center p-5">
                        <Modal.Title className="w-100 text-center mb-4 fw-bolder">
                            {modalContent}
                        </Modal.Title>
                        <input
                            className="form-control text-center w-100"
                            type="text"
                            placeholder="Enter NTID"
                            onChange={(e) => setNtid(e.target.value)}
                            disabled={isVerifying} // Disable input while verifying
                        />
                           <Form.Group className="mb-3 position-relative mt-2">
                            <Form.Control
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                disabled={isVerifying}
                                placeholder="Search for a store"
                            />
                            {isDropdownOpen && filteredStores.length > 0 && (
                                <div ref={dropdownRef} className="dropdown-menu show position-absolute w-100" style={{height:'20rem', overflowY:'auto'}}>
                                    {filteredStores.map((store, index) => (
                                        <div
                                            key={index}
                                            className="dropdown-item"
                                            onClick={() => handleStoreSelect(store.storeaddress)}
                                            style={{ cursor: 'pointer' }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            {store.storeaddress}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Form.Group>
                        <Button
                            variant="success"
                            className="w-100 mt-4"
                            onClick={handleNtid}
                            disabled={isVerifying} // Disable button while verifying
                        >
                            {isVerifying ? 'Verifying...' : 'Verify'}
                        </Button>
                        {
                            error &&
                            <div class="alert alert-danger mt-2" role="alert">
                                {error}
                            </div>
                        }
                    </Modal.Body>
                }
            </Modal>
        </div>
    );
};

export default MngEvg;
