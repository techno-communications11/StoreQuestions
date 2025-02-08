import db from "../dbConnection/db.js";

const imageverify = async (req, res) => {
  try {
    // Extract data and id from the request body
    const { status, id } = req.body;
     console.log(req.body)

    // Validate input
    if (!status || !id) {
      return res.status(400).json({ success: false, message: "Data and ID are required" });
    }

    // Update the data value based on the input
    const updatedData = status === 'accepted' ? 'yes' : 'no';
    console.log(updatedData,'data')

    // Define the SQL query and values
    const query = "UPDATE images SET image_verified = ? WHERE id = ?";
    const values = [updatedData, id];

    // Execute the query
     const result=await db.promise().query(query, values);
      console.log(result)

    // Send a success response
    return res.status(200).json({ success: true, message: "Image verification status updated successfully" });
  } catch (err) {
    // Log the error and send an error response
    console.error("Error updating image verification:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default imageverify;