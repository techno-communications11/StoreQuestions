import { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Spinner,
  Alert,
  Form,
  Button,
  Container,
  Card,
  Dropdown,
  Row,
  Col
} from 'react-bootstrap';
import { IoMdDownload } from "react-icons/io";
import * as XLSX from 'xlsx';

import {
  BsCalendarDate,
  BsShop,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowRightCircle,
  BsFilterCircle,
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const StoreDashboard = ({ marketName, setStorename }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0] // Default to today
  });
  const [selectedFilters, setSelectedFilters] = useState({
    markets: [],
    stores: []
  });
  const navigate = useNavigate();

  // Memoized unique values for filters
  const uniqueMarkets = useMemo(() =>
    [...new Set(marketData.map(store => store.market))],
    [marketData]
  );

  const uniqueStores = useMemo(() => {
    // If no markets are selected, show all stores
    if (selectedFilters.markets.length === 0) {
      return [...new Set(marketData.map((store) => store.storename))];
    }

    // Otherwise, filter stores by selected markets
    return [
      ...new Set(
        marketData
          .filter((store) => selectedFilters.markets.includes(store.market)) // Filter by selected markets
          .map((store) => store.storename) // Extract store names
      ),
    ];
  }, [marketData, selectedFilters.markets]); // Add `selectedFilters.markets` as a dependency

  // Fetch market data with all active filters
  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentMarket = marketName || localStorage.getItem('marketName');
      const url = new URL(`${process.env.REACT_APP_BASE_URL}/getstorewiseuploadcount`);

      // Add all query parameters
      const params = new URLSearchParams({
        market: currentMarket,
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...(selectedFilters.markets.length && { markets: selectedFilters.markets.join(',') }),
        ...(selectedFilters.stores.length && { stores: selectedFilters.stores.join(',') })
      });

      url.search = params.toString();

      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        setMarketData(data.data);
      } else {
        setError(data.message || 'No data found for this market.');
      }
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchMarketData();
  }, [marketName, dateRange, selectedFilters]);

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const isSelected = prev[filterType].includes(value);
      return {
        ...prev,
        [filterType]: isSelected
          ? prev[filterType].filter(item => item !== value)
          : [...prev[filterType], value]
      };
    });
  };

  const clearFilters = (filterType) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: []
    }));
  };

  // Navigate to detailed view
  const handleStoreSelection = (storeName) => {
    localStorage.setItem('storeName', storeName);
    setStorename(storeName);
    navigate('/detaileddata');
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

  // Filter dropdown component
  const FilterDropdown = ({ title, items, filterType, selectedItems }) => (
    <Dropdown>
      <Dropdown.Toggle variant="outline-primary" className="w-100">
        {title} ({selectedItems.length} selected)
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ maxHeight: '20rem', overflowY: 'auto', width: '100%' }}>
        <Dropdown.Item onClick={() => clearFilters(filterType)}>
          Clear All
        </Dropdown.Item>
        <Dropdown.Divider />
        {items.map(item => (
          <Dropdown.Item
            key={item}
            onClick={(e) => {
              e.stopPropagation();
              handleFilterChange(filterType, item);
            }}
          >
            <Form.Check
              type="checkbox"
              label={item}
              checked={selectedItems.includes(item)}
              onChange={() => { }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );

  // Filtered data based on selected filters
  const filteredData = useMemo(() => {
    return marketData.filter(store => {
      const marketMatch = selectedFilters.markets.length === 0 ||
        selectedFilters.markets.includes(store.market);
      const storeMatch = selectedFilters.stores.length === 0 ||
        selectedFilters.stores.includes(store.storename);
      return marketMatch && storeMatch;
    });
  }, [marketData, selectedFilters]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4 bg-light">
      {/* Date Filter Section */}
      <Card className="shadow-sm mb-2">
        <Card.Header className=" d-flex bg-white">
          <Col xs={4} md={10}>
            <h5 className=" text-start mb-0">Date Filter</h5>
          </Col>

          <Col xs={8} md={2} className="text-end">
            <h5 className="mb-0 d-flex align-items-center justify-content-end">
              <span className=" me-2 live-indicator"></span>
              <span className="me-2 fw-bold text-danger"> Dafault Todays Data</span>
              {/* Live indicator */}
            </h5>
          </Col>
        </Card.Header>
        <Card.Body>
          <Form className="row g-3">
            <Col md={5}>
              <Form.Group>
                <Form.Label>
                  <BsCalendarDate className="me-2" />
                  Start Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border-pink"
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label>
                  <BsCalendarDate className="me-2" />
                  End Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border-pink"
                />
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button onClick={fetchMarketData} variant="pink" className="px-4 w-100">
                <BsFilterCircle className="me-2" />
                Apply Filter
              </Button>
            </Col>
            
          </Form>
        </Card.Body>
      </Card>

      {/* Filters Section */}
      <Card className="shadow-sm mb-2">
        <Card.Body>
          <Row className="g-3">
            <Col xs={12} md={5}>
              <FilterDropdown
                title="Market Filter"
                items={uniqueMarkets}
                filterType="markets"
                selectedItems={selectedFilters.markets}
              />
            </Col>
            <Col xs={12} md={5}>
              <FilterDropdown
                title="Store Filter"
                items={uniqueStores}
                filterType="stores"
                selectedItems={selectedFilters.stores}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button onClick={handleDownload} variant="pink" className="px-4 w-100"> <IoMdDownload className='me-2' />
              Download</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Data Display */}
      {filteredData.length > 0 ? (
        <>
          {/* Table View for Large Screens */}
          <div className="d-none d-lg-block">
            <Card className="shadow">
              <Card.Body>
                <Table hover responsive className="align-middle">
                  <thead>
                    <tr>
                      {['SINO', 'Market', 'Store Name', 'Completed', 'Not Completed'].map((header) => (
                        <th
                          key={header}
                          className="text-center"
                          style={{ backgroundColor: '#E10174', color: 'white' }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((store, index) => (
                      <tr
                        key={store.storename}
                        onClick={() => handleStoreSelection(store.storename)}
                        className="cursor-pointer text-center"
                      >
                        <td className="fw-bold text-success">{index + 1}</td>
                        <td className="text-pink fw-bold">
                          <BsArrowRightCircle className="me-2" />
                          {store.market}
                        </td>
                        <td className="text-primary fw-bold">
                          <BsShop className="me-2" />
                          {store.storename}
                        </td>
                        <td className="text-center text-success">
                          <BsCheckCircleFill className="me-2" />
                          {store.completed_count}
                        </td>
                        <td className="text-center text-danger">
                          <BsXCircleFill className="me-2" />
                          {store.not_completed_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>

          {/* Card View for Small Screens */}
          <div className="d-lg-none">
            <Row xs={1} md={2} className="g-2">
              {filteredData.map((store, index) => (
                <Col key={store.storename}>
                  <Card
                    className="h-100 shadow cursor-pointer"
                    onClick={() => handleStoreSelection(store.storename)}
                  >
                    <Card.Header className="bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-success">#{index + 1}</span>
                        <span className="text-pink fw-bold">
                          <BsArrowRightCircle className="me-2" />
                          {store.market}
                        </span>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-3">
                        <h5 className="text-primary mb-0">
                          <BsShop className="me-2" />
                          {store.storename}
                        </h5>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-success">
                          <BsCheckCircleFill className="me-2" />
                          <span className="fw-bold">{store.completed_count}</span>
                          <div className="small">Completed</div>
                        </div>
                        <div className="text-danger">
                          <BsXCircleFill className="me-2" />
                          <span className="fw-bold">{store.not_completed_count}</span>
                          <div className="small">Not Completed</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      ) : (
        <Alert variant="info" className="text-center">
          No data available for the selected filters.
        </Alert>
      )}

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .min-vh-50 {
          min-height: 50vh;
        }
        .border-pink {
          border-color: #E10174;
        }
        .border-pink:focus {
          border-color: #E10174;
          box-shadow: 0 0 0 0.25rem rgba(225, 1, 116, 0.25);
        }
        .btn-pink {
          background-color: #E10174;
          border-color: #E10174;
          color: white;
        }
        .btn-pink:hover {
          background-color: #c9016a;
          border-color: #c9016a;
          color: white;
        }
        .text-pink {
          color: #E10174;
        }
      `}</style>
    </Container>
  );
};

export default StoreDashboard;