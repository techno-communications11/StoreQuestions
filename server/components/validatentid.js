import db from "../dbConnection/db.js";

const validateNtid = async (req, res) => {
    const {ntid } = req.body;

    // Log the request body for debugging
    console.log(req.body);

    // Validate input
    if (!ntid) {
        return res.status(400).json({ message: " NTID are required" });
    }

    try {
        // Step 3: Get NTID and name from credentials table using doorCode
        const [ntidResults] = await db.promise().query("SELECT name FROM credentials WHERE ntid = ?", [ntid]);

        // Check if any record was found
        if (!ntidResults || ntidResults.length === 0) {
            return res.status(404).json({ message: "No NTID found for this doorCode" });
        }

        // Extract the matched record
        const matchedRecord = ntidResults[0];

        // Log the matched name for debugging
        console.log("Matched Name:", matchedRecord.name);

        // Step 5: Return success response with the matched name
        return res.status(200).json({
            message: "NTID validated successfully",
            name: matchedRecord.name,
        });
    } catch (error) {
        // Log detailed error information
        console.error("Error during NTID validation:", error.message);

        // Return a generic error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export default validateNtid;