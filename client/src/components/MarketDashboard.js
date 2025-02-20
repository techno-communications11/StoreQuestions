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
  Col,
  Dropdown,
  Badge
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { IoMdDownload } from "react-icons/io";
import {
  Calendar,
  Store,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { BsShop } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';

const MarketDashboard = ({ setStorename }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedStores, setSelectedStores] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const marketname = jwtDecode(token).market;

  const fetchMarketData = async (startDate = '', endDate = '') => {
    setLoading(true);
    setError(''); // Reset error state before making the API call

    try {
      // Validate marketname
      if (!marketname || typeof marketname !== 'string') {
        setError('Invalid market name.');
        return;
      }

      // Construct URL
      const url = new URL(`${process.env.REACT_APP_BASE_URL}/getstorewiseuploadcount`);
      url.searchParams.append('market', marketname);
      if (startDate) url.searchParams.append('startDate', startDate);
      if (endDate) url.searchParams.append('endDate', endDate);
      console.log(marketname)

      // Fetch data
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Handle response
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Ensure data.data is an array before filtering
        console.log(data.data)
        const filteredData = Array.isArray(data.data) ? data.data.filter(x => x.market === marketname) : [];
        setMarketData(filteredData);
        console.log(filteredData, 'data')
      } else {
        setError('No data found for this market.');
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Error fetching data. Please try again later.');
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

  const handleStoreChange = (storeName) => {
    setSelectedStores(prev =>
      prev.includes(storeName)
        ? prev.filter(item => item !== storeName)
        : [...prev, storeName]
    );
  };

  const filteredStores = marketData.filter(store =>
    selectedStores.length === 0 || selectedStores.includes(store.storename)
  );

  const uniqueStores = [...new Set(marketData.map(store => store.storename))];

  const handleDateFilter = (e) => {
    e.preventDefault();
    fetchMarketData(dateRange.start, dateRange.end);
  };

  const handleReset = () => {
    setDateRange({ start: '', end: '' });
    setSelectedStores([]);
    fetchMarketData();
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
    <Container fluid className="py-4 bg-light">
      {/* Dashboard Header */}
      <Row className="d-flex justify-content-between align-items-center mb-4">
  {/* Market Name and Dashboard Title */}
  <Col xs={12} md={6} className="mb-2 mb-md-0 text-pink text-capitalize text-center text-md-start">
  <h1>
  <BarChart3 className="d-inline me-2" size={24} />
  {marketname?.toLowerCase() || localStorage.getItem('marketname')?.toLowerCase()} Dashboard
  </h1>
    
  </Col>

  {/* Live Indicator */}
  <Col xs={12} md={6} className="text-center text-md-end mb-2 mb-md-0">
    <h5 className="mb-0 d-flex align-items-center justify-content-center justify-content-md-end">
      <span className="me-2 live-indicator"></span>
      <span className="me-2 fw-bold text-danger">Default Today's Data</span>
    </h5>
  </Col>

  {/* Reset Button */}
  <Col xs={12} md={2} className="d-flex justify-content-center justify-content-end ms-auto">
    <Button variant="outline-secondary" onClick={handleReset} className="d-flex align-items-center w-100 text-center ">
      <RefreshCw  className="me-2" />
      Reset Filters
    </Button>
  </Col>
</Row>


      {/* Filters Card */}
      <Card className="shadow-sm border-0 mb-2">
        <Card.Body>
          <Row className="g-3">
            <Col lg={6}>
              <Form onSubmit={handleDateFilter}>
                <Row className="g-3">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center">
                        <Calendar size={14} className="me-2" />
                        Start Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label className="d-flex align-items-center">
                        <Calendar size={14} className="me-2" />
                        End Date
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <Button type="submit" variant="pink" className="w-100">
                      <Filter size={14} className="me-2" />
                      Filter
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col lg={4}>
              <Form.Label className="d-flex align-items-center">
                <Store size={14} className="me-2" />
                Store Filter
                {selectedStores.length > 0 && (
                  <Badge bg="pink" className="ms-2">
                    {selectedStores.length} selected
                  </Badge>
                )}
              </Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="outline-primary" className="w-100 d-flex justify-content-between align-items-center">
                  Select Stores
                  <ChevronDown size={14} />
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <Dropdown.Item
                    onClick={() => setSelectedStores([])}
                    className="text-danger"
                  >
                    Clear All
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  {uniqueStores.map(store => (
                    <Dropdown.Item
                      key={store}
                      onClick={() => handleStoreChange(store)}
                      active={selectedStores.includes(store)}
                    >
                      <Form.Check
                        type="checkbox"
                        label={store}
                        checked={selectedStores.includes(store)}
                        onChange={() => { }}
                      />
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col xs={12} md={2}>
              <Button onClick={handleDownload}  style={{marginTop:'2rem'}} variant="pink" className="px-4 w-100 "> <IoMdDownload className='me-2' />
                Download</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      {/* Data Display - Table for Large Screens */}
      {!loading && !error && marketData.length > 0 && (
        <div className="d-none d-lg-block">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Table hover responsive className="mb-0">
                <thead>
                  <tr >
                    <th style={{ backgroundColor: '#E10174', color: 'white' }}>SINO</th>
                    <th style={{ backgroundColor: '#E10174', color: 'white' }}>Store Name</th>
                    <th style={{ backgroundColor: '#E10174', color: 'white' }} className="text-center">Completed</th>
                    <th style={{ backgroundColor: '#E10174', color: 'white' }} className="text-center">Not Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((store, index) => (
                    <tr
                      key={index}
                      onClick={() => handleStore(store.storename)}
                      style={{ cursor: 'pointer' }}
                      className="align-middle"
                    >
                      <td>{index + 1}</td>
                      <td className="fw-bold text-primary">{store.storename}</td>
                      <td className="text-center text-success">
                        <CheckCircle2 size={16} className="me-2" />
                        {store.completed_count}
                      </td>
                      <td className="text-center text-danger">
                        <XCircle size={16} className="me-2" />
                        {store.not_completed_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Data Display - Cards for Small Screens */}
      {!loading && !error && marketData.length > 0 && (
        <div className="d-lg-none">
          <Row xs={1} md={2} className="g-2">
            {filteredStores.map((store, index) => (
              <Col key={index}>
                <Card
                  className="h-100 shadow-sm border-0"
                  onClick={() => handleStore(store.storename)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className='p-4'>
                    <Card.Title className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-pink"> <BsShop className="me-2" />{store.storename}</span>
                    </Card.Title>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-success d-flex align-items-center">
                        <CheckCircle2 size={18} className="me-2" />
                        Completed {store.completed_count}
                      </div>
                      <div className="text-danger d-flex align-items-center">
                        <XCircle size={18} className="me-2" />
                        Not Completed {store.not_completed_count}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && marketData.length === 0 && (
        <Alert variant="info" className="text-center">
          No stores found for this market.
        </Alert>
      )}
    </Container>
  );
};

export default MarketDashboard;