const fetchStores = async () => {
    try {
        // console.log('Fetching from:', `${process.env.REACT_APP_BASE_URL}/stores`); // Log URL
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/stores`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            
        });


        if (!response.ok) {
            const errorText = await response.text(); // Get raw response body for non-200 statuses
            throw new Error(`Failed to fetch stores: ${response.status} - ${errorText}`);
        }

        const data = await response.json(); // Parse JSON only if response is OK
      
        return data;
    } catch (error) {
        console.error('Error fetching stores:', error.message); // Log detailed error
        return { error: error.message }; // Return detailed error message
    }
};

export default fetchStores;