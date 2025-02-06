import { useState, useEffect } from "react";

const useMarkets = () => {
    const [markets, setMarkets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errormarket, setError] = useState(null);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getmarkets`);
 // Adjust the API route as needed
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setMarkets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    return { markets, loading, errormarket };
};

export default useMarkets;
