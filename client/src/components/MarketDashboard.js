import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  Table, 
  Spinner, 
  Alert, 
  Form, 
  Button, 
  Card, 
  Container, 
  Row, 
  Col 
} from 'react-bootstrap';
import { 
  FaCalendarAlt, 
  FaStore, 
  FaCheck, 
  FaTimes, 
  FaFilter 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MarketDashboard.css';

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
        setLoading(true);
        try {
            const url = `${process.env.REACT_APP_BASE_URL}/getstorewiseuploadcount?market=${marketname}&startDate=${startDate}&endDate=${endDate}`;
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
        fetchMarketData();
    }, [marketname]);

    const handleStore = (storename) => {
        localStorage.setItem('storename', storename);
        setStorename(storename);
        navigate('/detaileddata');
    };

    const handleDateFilter = (e) => {
        e.preventDefault();
        fetchMarketData(startDate, endDate);
    };

    return (
        <Container fluid className="market-dashboard p-4">
            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="pink" />
                </div>
            )}

            {error && (
                <Alert variant="danger" className="animate-bounce">
                    {error}
                </Alert>
            )}

            <Card className="shadow-lg border-pink mb-4">
                <Card.Header className="bg-pink text-white text-center text-capitalize fs-3">
                    <FaStore className="me-2 fs-1" />
                    {marketname?.toLowerCase() || localStorage.getItem('marketname')?.toLowerCase()} Dashboard
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleDateFilter} className="mb-4">
                        <Row>
                            <Col md={5}>
                                <Form.Group controlId="startDate" className="mb-3">
                                    <Form.Label>
                                        <FaCalendarAlt className="me-2 text-pink" /> Start Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border-pink"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group controlId="endDate" className="mb-3">
                                    <Form.Label>
                                        <FaCalendarAlt className="me-2 text-pink" /> End Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border-pink"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-flex mb-3 align-items-end">
                                <Button 
                                    type="submit" 
                                    variant="pink" 
                                    className="w-100 animate-pulse"
                                >
                                    <FaFilter className="me-2" /> Apply
                                </Button>
                            </Col>
                        </Row>
                    </Form>

                    {!loading && !error && marketData.length > 0 && (
                        <div className="table-responsive table-scroll" >
                            <Table striped hover className="store-table">
                                <thead className="table-header">
                                    <tr className='text-center'>
                                        <th style={{backgroundColor:'#E10174',color:'white'}}>SINO</th>
                                        <th style={{backgroundColor:'#E10174',color:'white'}}>Store Name</th>
                                        <th style={{backgroundColor:'#E10174',color:'white'}}>Completed</th>
                                        <th style={{backgroundColor:'#E10174',color:'white'}}>NOT Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketData.map((store, index) => (
                                        <tr 
                                            key={index} 
                                            className="store-row text-center"
                                            onClick={() => handleStore(store.storename)}
                                        >
                                            <td >{index + 1}</td>
                                            <td>{store.storename}</td>
                                            <td>
                                                {store.completed_count}
                                                    
                                            </td>
                                            <td>
                                                {store.not_completed_count}
                                                    
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {!loading && !error && marketData.length === 0 && (
                        <Alert variant="info" className="text-center">
                            No stores found for this market.
                        </Alert>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default MarketDashboard;