const fetchStores = async () => {
    try {
        // console.log('Fetching from:', `${process.env.REACT_APP_BASE_URL}/stores`); // Log URL
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/stores`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            
        });

         console.log(response.data,"ddddddddddddd")

        // console.log('Response status:', response.status); // Log status code
        // console.log('Response OK:', response.ok); // Log if response is OK

        if (!response.ok) {
            const errorText = await response.text(); // Get raw response body for non-200 statuses
            throw new Error(`Failed to fetch stores: ${response.status} - ${errorText}`);
        }

        const data = await response.json(); // Parse JSON only if response is OK
        console.log('Fetched data:', data); // Log parsed data
        return data;
    } catch (error) {
        console.error('Error fetching stores:', error.message); // Log detailed error
        return { error: error.message }; // Return detailed error message
    }
};

export default fetchStores;