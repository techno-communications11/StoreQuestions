
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FaFilter, FaSyncAlt, FaStore } from 'react-icons/fa'; // Importing React Icons
import { useNavigate } from 'react-router-dom';
import './Styles/DMDashboard.css'; // Import custom CSS for additional styling
import * as XLSX from 'xlsx';
import { IoMdDownload } from "react-icons/io";
import { useUserContext } from '../Auth/UserContext';

const DMDashboard = () => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const navigate = useNavigate();

     const { userData,setStorename } = useUserContext(); 
   
 const dmname=userData.name;

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
                credentials:'include'
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
        localStorage.setItem('storename', btoa(storename));
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
    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(marketData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Data');

        // Generate Excel file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'MarketData.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
            <Row>
                <Col xs={12} md={6} className="text-start">
                    <h1 className="text-start  text-capitalize mb-4 text-pink animate__animated animate__fadeInDown">

                        <FaStore className="me-2" /> {dmname?.toLowerCase()} Dashboard
                    </h1>
                </Col>

                <Col xs={12} md={6} className="text-end">
                    <h5 className="mb-0 d-flex align-items-center justify-content-end">
                        <span className=" me-2 live-indicator"></span>
                        <span className="me-2 fw-bold text-danger"> Dafault Todays Data</span>
                        {/* Live indicator */}
                    </h5>
                </Col>
            </Row>
            {/* Dashboard Header */}



            {/* Date Filter Section */}
            <Row className="justify-content-center mb-4 animate__animated animate__fadeInUp">
                <Col md={12} lg={12}>
                    <Form>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fw-bolder text-success'>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-light text-dark"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className='fw-bolder text-success'>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-light text-dark"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end mb-3">
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
                                <Button onClick={handleDownload} variant="pink" className="px-4 w-75 ms-3">
                                    <IoMdDownload className='me-2' />
                                    Download
                                </Button>
                            </Col>

                        </Row>
                    </Form>
                </Col>
            </Row>

            {/* Table Section for Larger Screens */}
            {!loading && !error && marketData.length > 0 && (
                <>
                    {/* Table for Larger Screens */}
                    <Row className="justify-content-center d-none d-md-block animate__animated animate__fadeIn">
                        <Col md={12} lg={12}>
                            <Table striped bordered hover responsive className="custom-table bg-light">
                                <thead className="table-pink">
                                    <tr>
                                        <th>SINO</th>
                                        <th>Store Name</th>
                                        <th>Completed</th>
                                        <th>Not Completed</th>
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
                                            <td>{store.completed}</td>
                                            <td>{store.not_completed}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>

                    {/* Cards for Small Screens */}
                    <Row className="justify-content-center d-block d-md-none animate__animated animate__fadeIn">
                        {marketData.map((store, index) => (
                            <Col key={index} sm={12} className="mb-3">
                                <Card
                                    onClick={() => handleStore(store.storename)}
                                    style={{ cursor: 'pointer' }}
                                    className="text-pink-hover"
                                >
                                    <Card.Body>
                                        <Card.Title className='text-pink fw-bolder'>{store.storename}</Card.Title>
                                        <Card.Text>
                                            <strong className='text-success fw-bolder'>Completed:</strong> {store.completed}
                                            <br />
                                            <strong className='text-danger fw-bolder'>Not Completed:</strong> {store.not_completed}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
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