import { Card } from 'react-bootstrap';

const FeatureCard = ({ icon: Icon, title, description, buttonText, onClick }) => (
  <Card className="feature-card text-center border-0 mt-0 mt-md-4 mt-lg-4">
    <Card.Body className="d-flex flex-column align-items-center p-0 p-md-4 p-lg-4">
      <div className="icon-wrapper">
        <Icon className="feature-icon" />
      </div>
      <Card.Title className="fw-bold text-uppercase mt-0 mt-lg-3 mt-md-3">{title}</Card.Title>
      <Card.Text className="text-muted mb-4">{description}</Card.Text>
      <button onClick={onClick} className="btn btn-primary mt-auto fw-bold action-button">
        {buttonText}
      </button>
    </Card.Body>
  </Card>
);

export default FeatureCard;