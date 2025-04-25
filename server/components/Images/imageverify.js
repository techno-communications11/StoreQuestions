import db from '../../dbConnection/db.js'; 
import { Resend } from "resend"; // Import the Resend API

const resend = new Resend(process.env.RESEND_API_KEY); // Initialize with API key

const imageverify = async (req, res) => {
  try {
    // Extract status, id, and ids from the request body
    const { status, id, ids,name } = req.body;
    // console.log(req.body, "Request Data");

    // Validate input
    if (!status ||!name|| (!id && (!ids || !Array.isArray(ids) || ids.length === 0))) {
      return res.status(400).json({ success: false, message: "Status and at least one ID are required" });
    }

    // Update database based on single or multiple IDs
    let query, values;
    if (id) {
      // Case: Single ID
      query = "UPDATE images SET image_verified = ?,verified_by=? WHERE id = ?";
      values = [status,name, id];
    } else {
      // Case: Multiple IDs - Only update if both `verified_by` and `image_verified` are NULL
      query = `UPDATE images 
               SET image_verified = ?, verified_by = ? 
               WHERE id IN (${ids.map(() => "?").join(",")}) 
               AND verified_by IS NULL 
               AND image_verified IS NULL`; // Skip records where either field is already set
  
      values = [status, name, ...ids]; 
  }
  
  

    // Execute the update query
    const [result] = await db.promise().query(query, values);
    // console.log(result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Image ID(s) not found" });
    }

    // Fetch user emails related to images
    let emailQuery = `
      SELECT ms.storeemail, i.createdat, i.question_id, i.id
      FROM marketstructure ms
      JOIN images i ON ms.storeaddress = i.storeaddress
      WHERE i.id IN (${id ? "?" : ids.map(() => "?").join(",")});
    `;
    const [userResults] = await db.promise().query(emailQuery, id ? [id] : ids);

    if (userResults.length === 0) {
      return res.status(404).json({ success: false, message: "No users found for the provided images" });
    }

    // Loop through each user and send an email
    for (const user of userResults) {
      const { storeemail: userEmail, createdat: createdAt, question_id: questionId, id: imageId } = user;

      // Prepare the email content
      let emailBody = `
        <h1 style="font-family: Arial, sans-serif; color: #333;">Image Verification Status</h1>
        <p>Dear User,</p>
        <p>Your image verification status has been updated to: <strong>${status === "yes" ? "Accepted" : "Rejected"}</strong>.</p>
        <p>For the image uploaded on ${createdAt}</p>
      `;

      // If the status is 'rejected', fetch the related question from the Questions table
      if (status === "no" && questionId) {
        const questionQuery = `SELECT Question FROM questions WHERE id = ?;`;
        const [questionResult] = await db.promise().query(questionQuery, [questionId]);

        if (questionResult.length > 0) {
          emailBody += `
            <p>The rejected image corresponds to the following question:</p>
            <p><strong>${questionResult[0].Question}</strong></p>
          `;
        }
      }

      emailBody += `
        <p>Thank you for your cooperation.</p>
        <p>Best regards,</p>
        <p>Your Team</p>
        <a href="https://yourapp.com" style="padding:10px 20px;background-color:#007BFF;color:white;border-radius:5px;text-decoration:none;">View Details</a>
      `;

      // Send the email using Resend API
      await resend.emails.send({
        from: "ticketing@techno-communications.com", // Sender email
        to: userEmail, // Recipient email
        subject: `Image Verification Status: ${status === "yes" ? "Accepted" : "Rejected"}`,
        html: emailBody,
      });

      // console.log(`Email sent successfully to ${userEmail} for image ID: ${imageId}`);
    }

    // Send success response
    return res.status(200).json({
      success: true,
      message: "Image verification status updated and email notifications sent successfully",
    });
  } catch (err) {
    console.error("Error updating image verification:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default imageverify;
