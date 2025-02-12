import db from "../dbConnection/db.js";
import { Resend } from "resend"; // Import the Resend API
const resend = new Resend(process.env.RESEND_API_KEY); // Initialize with API key

const imageverify = async (req, res) => {
  try {
    // Extract data and id from the request body
    const { status, id } = req.body;
    console.log(req.body,'ssssssssssssss');

    // Validate input
    if (!status || !id) {
      return res.status(400).json({ success: false, message: "Status and ID are required" });
    }

    // Update the data value based on the input
    const updatedData = status;
    console.log(updatedData, 'data');

    // Define the SQL query to update the image verification status
    const query = "UPDATE images SET image_verified = ? WHERE id = ?";
    const values = [updatedData, id];

    // Execute the query to update the image verification status
    const [result] = await db.promise().query(query, values);
    console.log(result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Image ID not found" });
    }

    // Query to get the email associated with the image ID
    const emailQuery = `
      SELECT ms.storeemail, i.createdat, i.question_id
      FROM marketstructure ms
      JOIN images i ON ms.storeaddress = i.storeaddress
      WHERE i.id = ?;
    `;
    const [userResult] = await db.promise().query(emailQuery, [id]);

    if (userResult.length === 0) {
      return res.status(404).json({ success: false, message: "User not found for this image" });
    }

    // Get the user's email, creation date of the image, and question_id
    const userEmail = userResult[0].storeemail;
    const createdAt = userResult[0].createdat;
    const questionId = userResult[0].question_id;

    // Prepare the email content
    let emailBody = `
      <h1 style="font-family: Arial, sans-serif; color: #333;">Image Verification Status</h1>
      <p>Dear User,</p>
      <p>Your image verification status has been updated to: <strong>${status === 'yes' ? 'Accepted' : 'Rejected'}</strong>.</p>
      <p>For the image uploaded on ${createdAt}</p>
    `;

    // If the status is 'rejected', fetch the related question from the Questions table
    if (status === 'no') {
      const questionQuery = `
        SELECT Question
        FROM questions
        WHERE id = ?;
      `;
      const [questionResult] = await db.promise().query(questionQuery, [questionId]);

      if (questionResult.length === 0) {
        return res.status(404).json({ success: false, message: "Question not found for this image" });
      }

      const question = questionResult[0].Question;

      emailBody += `
        <p>The rejected image for the following Question:</p>
        <p><strong>${question}</strong></p>
      `;
    }

    emailBody += `
      <p>Thank you for your cooperation.</p>
      <p>Best regards,</p>
      <p>Your Team</p>
      <a href="https://yourapp.com" style="padding:10px 20px;background-color:#007BFF;color:white;border-radius:5px;text-decoration:none;">View Details</a>
    `;

    // Use Resend API to send an email
    await resend.emails.send({
      from: "ticketing@techno-communications.com", // Sender email
      to: userEmail,  // Recipient email
      subject: `Image Verification Status: ${status === 'yes' ? 'Accepted' : 'Rejected'}`, // Subject
      html: emailBody,  // HTML email body
    });

    console.log(`Email sent successfully to ${userEmail}`);

    // Send a success response
    return res.status(200).json({
      success: true,
      message: "Image verification status updated and email notification sent successfully",
    });
  } catch (err) {
    // Log the error and send an error response
    console.error("Error updating image verification:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default imageverify;
