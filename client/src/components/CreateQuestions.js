import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Alert } from "react-bootstrap";
import { FaToggleOn, FaToggleOff, FaPlusCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const CreateQuestions = () => {
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [dailyChecklistType, setDailyChecklistType] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getQuestion`);
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setAlertMessage({ type: "danger", text: "Failed to load questions." });
      }
    };
    fetchQuestions();
  }, []);

  // Handle creating a new question
  const handleCreateQuestion = async () => {
    if (!questionType || !questionText) {
      setAlertMessage({ type: "warning", text: "Please fill in all fields." });
      return;
    }

    if (questionType === "Daily Question" && !dailyChecklistType) {
      setAlertMessage({
        type: "warning",
        text: "Please select a checklist type for Daily Questions.",
      });
      return;
    }

    setLoading(true);

    const tempId = Date.now(); // Temporary ID for optimistic updates
    const newQuestion = {
      id: tempId,
      type: questionType,
      checklistType: questionType === "Daily Question" ? dailyChecklistType : "",
      Question: questionText,
      isEnabled: true, // Default to enabled
    };

    // Optimistically update the UI
    setQuestions([newQuestion, ...questions]);

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/addQuestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred.");
      }

      const createdQuestion = await response.json();

      // Replace the temporary question with the server's response
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === tempId
            ? { ...createdQuestion.question, id: createdQuestion.question.id } // Use the server-provided ID
            : q
        )
      );

      // Clear form fields and show success message
      setQuestionType("");
      setQuestionText("");
      setDailyChecklistType("");
      setAlertMessage({ type: "success", text: "Question created successfully!" });
    } catch (error) {
      console.error("Error creating question:", error);
      setAlertMessage({ type: "danger", text: error.message });

      // Rollback the optimistic update
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  // Handle toggling question status
  const handleToggleQuestionStatus = async (id) => {
    try {
      if (!id) {
        throw new Error("Invalid question ID.");
      }

      const questionToToggle = questions.find((q) => q.id === id);
      const newStatus = !questionToToggle.isEnabled;

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/toggleQuestionStatus/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred.");
      }

      // Update the question status in the state
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === id ? { ...q, isEnabled: newStatus } : q
        )
      );

      setAlertMessage({ type: "success", text: `Question ${newStatus ? "enabled" : "disabled"} successfully!` });
    } catch (error) {
      console.error("Error toggling question status:", error);
      setAlertMessage({ type: "danger", text: error.message });
    }
  };

  return (
    <Container fluid className="bg-light min-vh-100">
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="d-flex justify-content-center align-items-center text-white mb-3"
          style={{
            backgroundImage: "url(/question.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "150px",
            width: "100%",
            opacity: "0.8",
          }}
        >
          <h1 className="fw-bolder display-1 display-md-3 display-sm-5">
            Create Questions
          </h1>
        </div>
      </motion.div>

      {/* Alert Message */}
      {alertMessage && (
        <Alert variant={alertMessage.type} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage.text}
        </Alert>
      )}

      {/* Form Section */}
      <motion.div
        className="card p-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Row className="align-items-end g-3">
          {/* Question Type Dropdown */}
          <Col md={2}>
            <Form.Select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
            >
              <option value="">Select Question Type</option>
              <option value="Daily Question">Daily Questions</option>
              <option value="Compliance Question">Compliance Questions</option>
            </Form.Select>
          </Col>

          {/* Daily Checklist Type Dropdown */}
          {questionType === "Daily Question" && (
            <Col md={2}>
              <Form.Select
                value={dailyChecklistType}
                onChange={(e) => setDailyChecklistType(e.target.value)}
              >
                <option value="">Select Checklist Type</option>
                <option value="Morning Question">Morning Question</option>
                <option value="Evening Question">Evening Question</option>
              </Form.Select>
            </Col>
          )}

          {/* Question Text Input */}
          <Col md={7}>
            <Form.Control
              as="textarea"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={1}
              placeholder="Enter your question here..."
            />
          </Col>

          {/* Create Button */}
          <Col md={1}>
            <Button
              onClick={handleCreateQuestion}
              disabled={loading}
              className="w-100"
              style={{ backgroundColor: "#FF69B4", borderColor: "#FF69B4" }}
            >
              <FaPlusCircle className="me-2" />
              {loading ? "Creating..." : "Create"}
            </Button>
          </Col>
        </Row>
      </motion.div>

      {/* Questions List */}
      <motion.div
        className="mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {questions.length === 0 ? (
          <p className="text-muted text-center">No questions created yet.</p>
        ) : (
          questions.map((question) => (
            <motion.div
              key={question.id}
              className="card mt-2 p-3"
              whileHover={{ scale: 1.01 }}
            >
              <Row className="align-items-center">
                <Col md={10}>
                  <p>
                    <strong>Question Type:</strong> {question.type}
                  </p>
                  {question.checklistType && (
                    <p>
                      <strong>Checklist Type:</strong> {question.checklistType}
                    </p>
                  )}
                  <p>
                    <strong>Question:</strong> {question.Question}
                  </p>
                </Col>
                <Col md={2} className="text-md-end">
                  <Button
                    variant={question.isEnabled ? "success" : "secondary"}
                    className="w-100 w-md-0 w-lg-0"
                    onClick={() => handleToggleQuestionStatus(question.id)}
                    aria-label={`Toggle question status: ${question.Question}`}
                  >
                    {question.isEnabled ? <FaToggleOn className="me-2" /> : <FaToggleOff className="me-2" />}
                    {question.isEnabled ? "Disable" : "Enable"}
                  </Button>
                </Col>
              </Row>
            </motion.div>
          ))
        )}
      </motion.div>
    </Container>
  );
};

export default CreateQuestions;