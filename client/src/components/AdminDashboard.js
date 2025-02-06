import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({setMarketname}) => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const navigate=useNavigate();

  // Fetch market upload status data
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);  // Start loading
  
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getmarketwise`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        // Check if the response is successful
        if (response.ok) {
          const data = await response.json(); // Parse the JSON data
  
          // Check if the API response contains a success flag and data
          if (data.success) {
            setMarketData(data.data); // Set the data in state
          } else {
            setError('Error: No data received');
          }
        } else {
          setError('Error fetching data');
        }
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);  // Stop loading
      }
    };
  
    fetchMarketData();
  }, []);
  
   const handleClick=(market)=>{
    // alert(market)
     localStorage.setItem('marketname',market)
    setMarketname(market)
    navigate('/storedashboard')
   }

  return (
    <div className="container mt-4">
      <h2 className="text-center">Market Upload Dashboard</h2>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-danger">{error}</div>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Stores Completed</th>
                  <th> Stores Not Completed</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((item) => (
                  <tr key={item.market}>
                    <td style={{cursor:'pointer'}} onClick={()=>handleClick(item.market)}> {item.market}</td>
                    <td>{item.uploaded_stores_count}</td>
                    <td>{item.not_uploaded_stores_count}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
