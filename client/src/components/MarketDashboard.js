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
        const filteredData = Array.isArray(data.data) ? data.data.filter(x => x.market?.toLowerCase()===marketname) : [];
        setMarketData(filteredData);
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

  return (
    <Container fluid className="py-4 bg-light">
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0  text-pink text-capitalize">
            <BarChart3 className=" d-inline " size={24} />
            {marketname?.toLowerCase() || localStorage.getItem('marketname')?.toLowerCase()} Dashboard
          </h3>
        </div>
        <Button 
          variant="outline-secondary" 
          onClick={handleReset}
          className="d-flex align-items-center"
        >
          <RefreshCw size={16} className="me-2" />
          Reset Filters
        </Button>
      </div>

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
            <Col lg={6}>
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
                        onChange={() => {}}
                      />
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
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
                    <th style={{backgroundColor:'#E10174',color:'white'}}>SINO</th>
                    <th style={{backgroundColor:'#E10174',color:'white'}}>Store Name</th>
                    <th style={{backgroundColor:'#E10174',color:'white'}} className="text-center">Completed</th>
                    <th  style={{backgroundColor:'#E10174',color:'white'}}className="text-center">Not Completed</th>
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