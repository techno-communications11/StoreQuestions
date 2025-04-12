import React, { useState } from "react";
import { Row, Col, Button, Form, Alert } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import MultipleMarketSelect from "./MultipleMarketSelect";

const QuestionForm = ({
  questions,
  setQuestions,
  alertMessage,
  setAlertMessage,
  loading,
  setLoading,
}) => {
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [dailyChecklistType, setDailyChecklistType] = useState("");
    const [selectedMarkets, setSelectedMarkets] = useState([]);
    console.log(selectedMarkets, "selected markets in question form")

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

    const tempId = Date.now();
    const newQuestion = {
      id: tempId,
      type: questionType,
      checklistType: questionType === "Daily Question" ? dailyChecklistType : "",
      Question: questionText,
      selectedMarkets: selectedMarkets,
      isEnabled: true,
    };

    setQuestions([newQuestion, ...questions]);

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/addQuestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
        credentials:'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred.");
      }

      const createdQuestion = await response.json();
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === tempId ? { ...createdQuestion.question, id: createdQuestion.question.id } : q
        )
      );

      setQuestionType("");
      setQuestionText("");
      setDailyChecklistType("");
      setAlertMessage({ type: "success", text: "Question created successfully!" });
    } catch (error) {
      console.error("Error creating question:", error);
      setAlertMessage({ type: "danger", text: error.message });
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alertMessage && (
        <Alert variant={alertMessage.type} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage.text}
        </Alert>
      )}

      <motion.div
        className="card p-4"
       
      >
        <Row className="align-items-end g-3">
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

          <Col md={2}>
          <div>
          <MultipleMarketSelect
              selectedMarkets={selectedMarkets}
              setSelectedMarkets={setSelectedMarkets}
            />
          </div>
           
          </Col>

          <Col md={5}>
            <Form.Control
              as="textarea"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={1}
              placeholder="Enter your question here..."
            />
          </Col>

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
    </>
  );
};

export default QuestionForm;