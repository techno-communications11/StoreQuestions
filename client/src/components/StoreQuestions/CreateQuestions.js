import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

const CreateQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getQuestion`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setAlertMessage({ type: "danger", text: "Failed to load questions." });
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <Container fluid className="bg-light min-vh-100">
      {/* Header Section */}
      <motion.div className="mb-4">
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
          aria-label="Question header background"
        >
          <h1 className="fw-bolder display-1 display-md-3 display-sm-5">
            Create Questions
          </h1>
        </div>
      </motion.div>

      <QuestionForm
        questions={questions}
        setQuestions={setQuestions}
        alertMessage={alertMessage}
        setAlertMessage={setAlertMessage}
        loading={loading}
        setLoading={setLoading}
      />

      <QuestionList
        questions={questions}
        setQuestions={setQuestions}
        setAlertMessage={setAlertMessage}
      />
    </Container>
  );
};

export default CreateQuestions;