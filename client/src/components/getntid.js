const getntid = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getntid`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch stores");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching stores:", error);
        return { error: "Unable to fetch stores" };
    }
};

export default getntid;
