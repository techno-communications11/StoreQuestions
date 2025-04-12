import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { motion } from "framer-motion";

const QuestionList = ({ questions, setQuestions, setAlertMessage }) => {
  const handleToggleQuestionStatus = async (id) => {
    try {
      if (!id) {
        throw new Error("Invalid question ID.");
      }

      const questionToToggle = questions.find((q) => q.id === id);
      const newStatus = !questionToToggle.isEnabled;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/toggleQuestionStatus/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isEnabled: newStatus }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred.");
      }

      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === id ? { ...q, isEnabled: newStatus } : q
        )
      );

      setAlertMessage({
        type: "success",
        text: `Question ${newStatus ? "enabled" : "disabled"} successfully!`,
      });
    } catch (error) {
      console.error("Error toggling question status:", error);
      setAlertMessage({ type: "danger", text: error.message });
    }
  };

  return (
    <motion.div className="mt-3">
      {questions.length === 0 ? (
        <div class="d-flex justify-content-center align-items-center vh-50">
          <div class="spinner-border p-5"></div>
        </div>
      ) : (
        questions.map((question) => (
          <motion.div key={question.id} className="card mt-2 p-3">
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
                <p>
                  <strong>Markets:</strong>{" "}
                  {question.selectedMarkets
                    ? JSON.parse(question.selectedMarkets)
                        .map((m) => m.toLowerCase())
                        .join(", ")
                    : "All Markets"}
                </p>
              </Col>
              <Col md={2} className="text-md-end">
                <Button
                  variant={question.isEnabled ? "success" : "secondary"}
                  className="w-100 w-md-0 w-lg-0"
                  onClick={() => handleToggleQuestionStatus(question.id)}
                  aria-label={`Toggle question status: ${question.Question}`}
                >
                  {question.isEnabled ? (
                    <FaToggleOn className="me-2" />
                  ) : (
                    <FaToggleOff className="me-2" />
                  )}
                  {question.isEnabled ? "Disable" : "Enable"}
                </Button>
              </Col>
            </Row>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default QuestionList;
