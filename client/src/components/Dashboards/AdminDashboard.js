import React, { useState, useEffect } from 'react'; //importing  from react
import { Card, Table, Form, Button, Container, Row, Col, Spinner,Alert } from 'react-bootstrap'; //importing the  components from bootstrap
import { useNavigate } from 'react-router-dom'; //importing usenaviage to navigate between pages
import { BsCalendarDate, BsBuilding, BsCheckCircleFill, 
         BsArrowRightCircle, BsFilterCircle } from 'react-icons/bs'; //icons from react-icons
import { motion } from 'framer-motion';

const AdminDashboard = ({ setMarketname }) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();


  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const start = startDate;
      const end = endDate;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/getmarketwise?startDate=${start}&endDate=${end}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials:'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMarketData(data.data);
        } else {
          setError("Error: No data received");
        }
      } else {
        setError("Error fetching data");
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleClick = (market) => {
    localStorage.setItem("marketname", market);
    setMarketname(market);
    navigate("/storedashboard");
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
            <h1 className="text-center fw-bold" style={{ color: '#FF69B4' }}>
              <BsBuilding className="me-2" />
              Market wise Dashboard
            </h1>
          </Col>
        </Row>

        <Card className="shadow-sm ">
          <Card.Body>
            <Form className="d-flex flex-wrap gap-3 align-items-end">
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
                variant="outline-pink"
                className="px-4"
                onClick={fetchMarketData}
              >
                <BsFilterCircle className="me-2" />
                Filter
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
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="shadow">
              <Card.Body>
                <Table hover className="align-middle">
                  <thead className="bg-light">
                    <tr >
                      <th className="text-white" style={{backgroundColor:'#E10174'}}>Market</th>
                      <th className="text-white text-center" style={{backgroundColor:'#E10174'}}>Completed Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((item, index) => (
                      <motion.tr
                        key={item.market}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        className="cursor-pointer"
                        onClick={() => handleClick(item.market)}
                      >
                        <td className="fw-bold" style={{ color: '#FF69B4' }}>
                          <BsArrowRightCircle className="me-2" />
                          {item.market}
                        </td>
                        <td className="text-center text-success">
                          <BsCheckCircleFill className="me-2" />
                          {item.count}
                        </td>
                       
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </motion.div>
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
      `}</style>
    </Container>
  );
};

export default AdminDashboard;