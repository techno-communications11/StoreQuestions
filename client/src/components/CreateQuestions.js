import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form,Alert  } from "react-bootstrap";
import { 
  FaQuestionCircle, 
  FaTrashAlt, 
  FaPlusCircle,
  FaCheckCircle 
} from "react-icons/fa";
import { motion } from "framer-motion";

const CreateQuestions = () => {
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
   

  // Fetch existing questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/getQuestion`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions); // Assuming the API returns an array of questions under 'questions'
        } else {
          console.error("Failed to fetch questions.");
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);


  
  const handleDeleteQuestion = async (id) => {
    try {
      // Send DELETE request to the server with the question ID
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/deleteQuestion/${id}`, {
        method: "POST",
      });
  
      if (response.ok) {
        // If the response is successful, remove the deleted question from the state
        setQuestions(questions.filter((question) => question.id !== id));
        setAlertMessage({ type: "success", text: "Question deleted successfully!" });
        setTimeout(() => setAlertMessage(null), 3000);

        console.log("Question deleted successfully!");
      } else {
        // If there's an error (e.g., question not found)
        const data = await response.json();
        console.error("Error:", data.error || "Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };
  
  

  const handleQuestionTypeChange = (e) => {
    setQuestionType(e.target.value);
  };

  const handleQuestionTextChange = (e) => {
    setQuestionText(e.target.value);
  };

  const handleCreateQuestion = async () => {
    if (questionType && questionText) {
      try {
        const newQuestion = {
          type: questionType,
          Question: questionText,
        };
  
        // Sending the newQuestion data to the server
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/addQuestion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newQuestion),
        });
  
        // Assuming server response is successful, update the state
        if (response.ok) {
          const createdQuestion = await response.json();
          setQuestions([ createdQuestion.question,...questions]); // Append the new question to the list
          
          // Clear the form fields
          setQuestionType("");
          setQuestionText("");
        } else {
          console.error("Failed to create question");
        }
      } catch (error) {
        console.error("Error creating question:", error);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  

  return (
    <Container fluid className="bg-light min-vh-100">
       
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className=" d-flex justify-content-center align-items-center text-white  mb-3" style={{
          backgroundImage: "url(/question.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "150px",
          width: "99.5%",
          opacity: "0.8",
        }}>
            <h1 style={{fontSize:'100px'}} className="fw-bolder">
            Create Questions
            </h1>
           
          
        </div>
      </motion.div>

      <motion.div
        className="card"
        style={{
            background: "linear-gradient(135deg,rgb(229, 237, 248) 0%,rgba(213, 245, 246, 0.32) 50%,rgba(248, 223, 241, 0.83) 100%)",
          }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="card-body p-4">
          <Row className="align-items-end g-3">
            <Col md={2} xs={12}>
              <Form.Group>
                <Form.Select 
                  value={questionType}
                  onChange={handleQuestionTypeChange}
                  className="border-pink"
                >
                  <option value="">Select Question Type</option>
                  <option value="Daily Question">Daily Questions</option>
                  <option value="Compliance Question">Compliance Questions</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={9} xs={12}>
              <Form.Group>
                <Form.Control
                  as="textarea"
                  value={questionText}
                  onChange={handleQuestionTextChange}
                  rows={1}
                  placeholder="Enter your question here..."
                  className="border-pink"
                />
              </Form.Group>
            </Col>
            <Col md={1} xs={12}>
              <Button
                className="w-100 btn-pink"
                onClick={handleCreateQuestion}
                style={{ backgroundColor: "#FF69B4", borderColor: "#FF69B4" }}
              >
                <FaPlusCircle className="me-2" />
                Create
              </Button>
            </Col>
          </Row>
        </div>
      </motion.div>

      

      <motion.div
        className="mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ maxHeight:'500px', overflowY:'auto' }}
      >
         {alertMessage && (
        <Alert variant={alertMessage.type} className="bg-success" onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage.text}
        </Alert>
      )}
       
        {questions.length === 0 ? (
          <p className="text-muted text-center">No questions created yet.</p>
        ) : (
          questions.sort((a,b)=>b.id-a.id).map((question) => (
            <motion.div
              key={question.id}
              className="card"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              whileHover={{ scale: 1.01 }}
            //   style={{ backgroundColor: "#FFF0F5" }}
              
            >
              <div className="card-body">
                <Row className="align-items-center p-2">
                  <Col xs={12} md={8} lg={10} className="d-flex flex-column flex-md-row gap-3">
                    <p className="mb-1 fs-6 fs-md-3" lg={4}>
                      <strong className=" text-dark">Question Type:</strong> 
                      <span className=" text-dark"> {question.type}</span>
                    </p>
                    <p className="mb-0 fs-6 fs-md-3" lg={6}>
                      <strong className=" text-dark">Question:</strong> 
                      <span className=" text-dark"> {question.Question}</span>
                    </p>
                  </Col>
                  <Col xs={12} md={4} lg={2} className="text-md-end mt-3 mt-md-0">
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="btn-md"
                    >
                      <FaTrashAlt className="me-2" />
                      Delete
                    </Button>
                  </Col>
                </Row>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </Container>
  );
};

export default CreateQuestions;
