import db from '../../dbConnection/db.js';

const createQuestion = async (req, res) => {
  try {
    const { id, type, Question, checklistType, selectedMarkets } = req.body;
    
    // Validate required fields
    if (!id || !type || !Question || !selectedMarkets) {
      return res.status(400).json({ 
        success: false,
        error: 'id, type, Question, and selectedMarkets are required fields' 
      });
    }

    // Validate checklistType if provided
    if (checklistType && !['Morning Question', 'Evening Question', 'Compliance Question'].includes(checklistType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid checklistType. Must be Morning, Evening, or Compliance Question'
      });
    }

    // Convert selectedMarkets to JSON string if it's an array
    const marketsValue = Array.isArray(selectedMarkets) 
      ? JSON.stringify(selectedMarkets) 
      : selectedMarkets;

    // Using async/await instead of callback
    const query = `
      INSERT INTO questions 
      (id, type, Question, checklistType, selectedMarkets) 
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.promise().query(query, [
      id,
      type,
      Question,
      checklistType || null, // Use null if checklistType not provided
      marketsValue
    ]);

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: {
        id,
        type,
        Question,
        checklistType: checklistType || 'Not specified',
        selectedMarkets: marketsValue
      }
    });

  } catch (error) {
    console.error('Error creating question:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Question with this ID already exists'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating question',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default createQuestion;