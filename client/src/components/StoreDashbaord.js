import { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsCalendarDate, BsShop, BsCheckCircleFill, BsXCircleFill, 
         BsArrowRightCircle, BsFilterCircle } from 'react-icons/bs';
import { motion } from 'framer-motion';

const StoreDashboard = ({ marketname, setStorename }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const fetchMarketData = async (startDate = '', endDate = '') => {
    setLoading(true);
    marketname = marketname || localStorage.getItem('marketname');
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
    <Container fluid className="py-4 bg-light">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Row className="mb-4">
          <Col>
            <h1 className="text-center fw-bold text-capitalize" style={{ color: '#FF69B4' }}>
              <BsShop className="me-2" />
              {marketname?.toLowerCase() || localStorage.getItem('marketname')?.toLowerCase()} Dashboard
            </h1>
          </Col>
        </Row>

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Form onSubmit={handleDateFilter} className="d-flex flex-wrap gap-3 align-items-end">
              <Form.Group>
                <Form.Label className="text-muted">
                  <BsCalendarDate className="me-2" />
                  Start Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-pink"
                />
              </Form.Group>

              <Form.Group>
                <Form.Label className="text-muted">
                  <BsCalendarDate className="me-2" />
                  End Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-pink"
                />
              </Form.Group>

              <Button 
                type="submit" 
                variant="outline-pink"
                className="px-4"
              >
                <BsFilterCircle className="me-2" />
                Apply Filter
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="pink" />
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : marketData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow">
              <Card.Body>
                <Table hover className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th className="text-muted">SINO</th>
                      <th className="text-muted">Store Name</th>
                      <th className="text-muted text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((store, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="cursor-pointer"
                      >
                        <td>{index + 1}</td>
                        <td 
                          onClick={() => handleStore(store.storename)}
                          className="fw-bold"
                          style={{ color: '#FF69B4' }}
                        >
                          <BsArrowRightCircle className="me-2" />
                          {store.storename}
                        </td>
                        <td className="text-center">
                          {store.status === 'Completed' ? (
                            <span className="badge-custom badge-success">
                              <BsCheckCircleFill className="me-2" />
                              Completed
                            </span>
                          ) : (
                            <span className="badge-custom badge-warning">
                              <BsXCircleFill className="me-2" />
                              Not Completed
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </motion.div>
        ) : (
          <Alert variant="info" className="text-center">
            No stores found for this market.
          </Alert>
        )}
      </motion.div>

      <style jsx>{`
        .border-pink {
          border-color: #FF69B4;
        }
        .border-pink:focus {
          border-color: #FF69B4;
          box-shadow: 0 0 0 0.25rem rgba(255, 105, 180, 0.25);
        }
        .btn-outline-pink {
          color: #FF69B4;
          border-color: #FF69B4;
        }
        .btn-outline-pink:hover {
          color: white;
          background-color: #FF69B4;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .spinner-border.text-pink {
          color: #FF69B4;
        }
        .badge-custom {
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          font-size: 0.9rem;
        }
        .badge-success {
          background-color: #d4edda;
          color: #155724;
        }
        .badge-warning {
          background-color: #fff3cd;
          color: #856404;
        }
      `}</style>
    </Container>
  );
};

export default StoreDashboard;