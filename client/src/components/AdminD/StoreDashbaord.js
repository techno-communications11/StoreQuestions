import React, { useState, useEffect, useMemo } from 'react';
import { Container, Alert } from 'react-bootstrap';
import DateFilter from './DateFilter.js';
import FilterDropdown from './FilterDropdown.js';
import TableView from './TableView.js';
import CardView from './CardView.js';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Spinner, Col, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { IoMdDownload } from 'react-icons/io';
import { useUserContext } from '../Auth/UserContext'; // Import context

const StoreDashboard = ({ marketName }) => { // Remove setStorename prop
  const { setStorename } = useUserContext(); // Get setStorename from context
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: new Date().toISOString().split('T')[0], // Default to today
  });
  const [selectedFilters, setSelectedFilters] = useState({
    markets: [],
    stores: [],
  });
  const navigate = useNavigate();

  // Memoized unique values for filters
  const uniqueMarkets = useMemo(() =>
    [...new Set(marketData.map(store => store.market))],
    [marketData]
  );

  const uniqueStores = useMemo(() => {
    if (selectedFilters.markets.length === 0) {
      return [...new Set(marketData.map(store => store.storename))];
    }
    return [
      ...new Set(
        marketData
          .filter(store => selectedFilters.markets.includes(store.market))
          .map(store => store.storename)
      ),
    ];
  }, [marketData, selectedFilters.markets]);

  // Fetch market data
  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentMarket = marketName || localStorage.getItem('marketName');
      const url = new URL(`${process.env.REACT_APP_BASE_URL}/getstorewiseuploadcount`);

      const params = new URLSearchParams({
        market: currentMarket,
        startDate: dateRange.start,
        endDate: dateRange.end,
        ...(selectedFilters.markets.length && { markets: selectedFilters.markets.join(',') }),
        ...(selectedFilters.stores.length && { stores: selectedFilters.stores.join(',') }),
      });

      url.search = params.toString();

      const response = await fetch(url, { 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include' 
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
  }, [marketName]);

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const isSelected = prev[filterType].includes(value);
      return {
        ...prev,
        [filterType]: isSelected
          ? prev[filterType].filter(item => item !== value)
          : [...prev[filterType], value],
      };
    });
  };

  const clearFilters = (filterType) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: [] }));
  };

  // Navigate to detailed view
  const handleStoreSelection = (storeName) => {
    localStorage.setItem('storeName', storeName); // Keep for backward compatibility
    setStorename(storeName); // Use context setter
    navigate('/detaileddata');
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(marketData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Market Data');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'MarketData.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return marketData.filter(store => {
      const marketMatch = selectedFilters.markets.length === 0 || selectedFilters.markets.includes(store.market);
      const storeMatch = selectedFilters.stores.length === 0 || selectedFilters.stores.includes(store.storename);
      return marketMatch && storeMatch;
    });
  }, [marketData, selectedFilters]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-50 py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <Container fluid className="py-4 bg-light">
      <DateFilter dateRange={dateRange} setDateRange={setDateRange} fetchMarketData={fetchMarketData} />
      <FilterSection
        uniqueMarkets={uniqueMarkets}
        uniqueStores={uniqueStores}
        selectedFilters={selectedFilters}
        handleFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        handleDownload={handleDownload}
      />
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {filteredData.length > 0 ? (
        <>
          <TableView filteredData={filteredData} handleStoreSelection={handleStoreSelection} />
          <CardView filteredData={filteredData} handleStoreSelection={handleStoreSelection} />
        </>
      ) : (
        <Alert variant="info" className="text-center">No data available for the selected filters.</Alert>
      )}
      <style jsx>{`
        .cursor-pointer { cursor: pointer; }
        .min-vh-50 { min-height: 50vh; }
        .border-pink { border-color: #E10174; }
        .border-pink:focus { border-color: #E10174; box-shadow: 0 0 0 0.25rem rgba(225, 1, 116, 0.25); }
        .btn-pink { background-color: #E10174; border-color: #E10174; color: white; }
        .btn-pink:hover { background-color: #c9016a; border-color: #c9016a; color: white; }
        .text-pink { color: #E10174; }
      `}</style>
    </Container>
  );
};

// Filter Section Component
const FilterSection = ({ uniqueMarkets, uniqueStores, selectedFilters, handleFilterChange, clearFilters, handleDownload }) => (
  <Card className="shadow-sm mb-2">
    <Card.Body>
      <Row className="g-3">
        <Col xs={12} md={5}>
          <FilterDropdown
            title="Market Filter"
            items={uniqueMarkets}
            filterType="markets"
            selectedItems={selectedFilters.markets}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
          />
        </Col>
        <Col xs={12} md={5}>
          <FilterDropdown
            title="Store Filter"
            items={uniqueStores}
            filterType="stores"
            selectedItems={selectedFilters.stores}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
          />
        </Col>
        <Col xs={12} md={2}>
          <Button onClick={handleDownload} variant="pink" className="px-4 w-100">
            <IoMdDownload className="me-2" /> Download
          </Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

export default StoreDashboard;