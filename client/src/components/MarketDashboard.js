import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Form, Button } from 'react-bootstrap'; // Importing Bootstrap components
import { useNavigate } from 'react-router-dom';

const MarketDashboard = ({ setStorename }) => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const marketname = jwtDecode(token).market;

    const fetchMarketData = async (startDate = '', endDate = '') => {
        setLoading(true); // Start loading
        try {
            // Construct the URL with optional date range
            const url = `${process.env.REACT_APP_BASE_URL}/getstorewiseuploadcount?market=${marketname}&startDate=${startDate}&endDate=${endDate}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data.success) {
                setMarketData(data.data); // Set the data received from server
            } else {
                setError('No data found for this market');
            }
        } catch (err) {
            setError('Error fetching data');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        fetchMarketData(); // Fetch data for the current day on initial load
    }, [marketname]);

    const handleStore = (storename) => {
        localStorage.setItem('storename', storename);
        setStorename(storename);
        navigate('/detaileddata');
    };

    const handleDateFilter = (e) => {
        e.preventDefault();
        fetchMarketData(startDate, endDate); // Fetch data for the selected date range
    };

    return (
        <div className="container mt-4">
            {loading && <Spinner animation="border" variant="primary" />}
            {error && <Alert variant="danger">{error}</Alert>}
            <h1 className='text-center text-capitalize'>{marketname?.toLowerCase() || localStorage.getItem('marketname')?.toLowerCase()} Dashboard</h1>

            {/* Date Range Filter */}
            <Form onSubmit={handleDateFilter} className="mb-3">
                <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="endDate" className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Form.Group>
                <Button type="submit" variant="primary">
                    Apply Filter
                </Button>
            </Form>

            {!loading && !error && marketData.length > 0 && (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <td>SINO</td>
                            <th>Store Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketData.map((store, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td style={{ cursor: 'pointer' }} onClick={() => handleStore(store.storename)}>
                                    {store.storename}
                                </td>
                                <td>
                                    <span className={`badge ${store.upload_count >= 1 ? 'bg-success' : 'bg-warning'}`}>
                                        {store.upload_count >= 1 ? 'Completed' : 'Not Completed'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            {!loading && !error && marketData.length === 0 && (
                <Alert variant="info">No stores found for this market.</Alert>
            )}
        </div>
    );
};

export default MarketDashboard;