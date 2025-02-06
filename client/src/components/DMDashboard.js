import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap'; // Importing Bootstrap components
import { useNavigate } from 'react-router-dom';

const DMDashboard = ({setStorename }) => {
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
     const navigate=useNavigate()
     const token=localStorage.getItem('token')
     const dmname =jwtDecode(token).name;

    useEffect(() => {
        const fetchMarketData = async () => {
            setLoading(true); // Start loading
          
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getdmstats?dmname=${dmname}`, {
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
                setLoading(false);  // Stop loading
            }
        };

        fetchMarketData();
    }, [dmname]);

     const handleStore=(storename)=>{
        localStorage.setItem('storename',storename)
        setStorename(storename)
        navigate('/detaileddata')
     }

    return (
        <div className="container mt-4">
            {loading && <Spinner animation="border" variant="primary" />}
            {error && <Alert variant="danger">{error}</Alert>}
            <h1 className='text-center text-capitalize'>{dmname?.toLowerCase()} Dashboard</h1>
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
                                <td>{index+1}</td>
                            <td style={{ cursor: 'pointer' }} onClick={() => handleStore(store.storename)}>
                                {store.storename}
                            </td>
                            <span className={`badge ${store.completed === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
            {store.completed === 'Completed' ? 'Completed' : 'Not Completed'}
        </span>
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

export default DMDashboard;
