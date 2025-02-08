import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Form, Button, Container, Row, Col } from 'react-bootstrap';
import { FaFilter, FaSyncAlt, FaStore } from 'react-icons/fa'; // Importing React Icons
import { useNavigate } from 'react-router-dom';
import './DMDashboard.css'; // Import custom CSS for additional styling

const DMDashboard = ({ setStorename }) => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const dmname = jwtDecode(token).name;

    const fetchMarketData = async (startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            let url = `${process.env.REACT_APP_BASE_URL}/getdmstats?dmname=${dmname}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (data.success) {
                setMarketData(data.data);
            } else {
                setError('No data found for this market');
            }
        } catch (err) {
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData(startDate, endDate);
    }, [dmname]);

    const handleStore = (storename) => {
        localStorage.setItem('storename', storename);
        setStorename(storename);
        navigate('/detaileddata');
    };

    const handleFilter = () => {
        fetchMarketData(startDate, endDate);
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        fetchMarketData('', '');
    };

    return (
        <Container fluid className="mt-4">
            {/* Loading Spinner */}
            {loading && (
                <Spinner animation="border" variant="pink" className="d-block mx-auto mt-5" />
            )}

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" className="text-center mt-5">
                    {error}
                </Alert>
            )}

            {/* Dashboard Header */}
            <h1 className="text-center text-capitalize mb-4 text-pink animate__animated animate__fadeInDown">
                <FaStore className="me-2" /> {dmname?.toLowerCase()} Dashboard
            </h1>

            {/* Date Filter Section */}
            <Row className="justify-content-center mb-4 animate__animated animate__fadeInUp">
                <Col md={12} lg={12}>
                    <Form>
                        <Row>
                            <Col md={5}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-light text-dark"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-light text-dark"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex align-items-end mb-3">
                                <Button
                                    variant="pink"
                                    onClick={handleFilter}
                                    className="me-2 d-flex align-items-center justify-content-center"
                                >
                                    <FaFilter className="me-2" /> Apply
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleReset}
                                    className="d-flex align-items-center justify-content-center"
                                >
                                    <FaSyncAlt className="me-2" /> Reset
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>

            {/* Table Section */}
            {!loading && !error && marketData.length > 0 && (
                <Row className="justify-content-center animate__animated animate__fadeIn">
                    <Col md={12} lg={12}>
                        <Table striped bordered hover responsive className="custom-table bg-light">
                            <thead className="table-pink">
                                <tr>
                                    <th>SINO</th>
                                    <th>Store Name</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketData.map((store, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleStore(store.storename)}
                                            className="text-pink-hover"
                                        >
                                            {store.storename}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    store.completed === 'Completed'
                                                        ? 'bg-success'
                                                        : 'bg-warning'
                                                }`}
                                            >
                                                {store.completed === 'Completed' ? 'Completed' : 'Not Completed'}
                                            </span>
                                        </td>
                                        <td>
                                            {store.createdAt
                                                ? new Date(store.createdAt).toLocaleString()
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}

            {/* No Data Found Message */}
            {!loading && !error && marketData.length === 0 && (
                <Row className="justify-content-center animate__animated animate__fadeIn">
                    <Col md={8} lg={6}>
                        <Alert variant="info" className="text-center">
                            No stores found for the selected date range.
                        </Alert>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default DMDashboard;