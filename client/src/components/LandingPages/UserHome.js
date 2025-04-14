import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaClipboardList, FaCheckCircle, FaArrowCircleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import validatingNtid from './Validatingntid';
import fetchStores from '../Utils/fetchStores';
import getntid from '../Utils/getntid';
import { useUserContext } from '../Auth/UserContext';
import HeaderSection from './HeaderSection';
import FeatureCard from './FeatureCard';
import NtidVerificationModal from './NtidVerificationModal';
import './Styles/UserHome.css';

const UserHome = () => {
  const { setNtidverify } = useUserContext();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [ntid, setNtid] = useState('');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [stores, setStores] = useState([]);
  const [ntidsdata, setNtidsdata] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [filteredNtid, setFilteredNtid] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const getStoresData = async () => {
      const data = await fetchStores();
      if (data.error) {
        setError(data.error);
      } else {
        setStores(data);
      }
    };
    const getntids = async () => {
      const data = await getntid();
      if (data.error) {
        setError(data.error);
      } else {
        setNtidsdata(data.map((store) => store.ntid));
      }
    };
    getntids();
    getStoresData();
  }, []);

  useEffect(() => {
    setFilteredNtid(ntidsdata.includes(ntid));
  }, [ntid, ntidsdata]);

  const openModal = (type) => {
    setError('');
    setModalContent(type === 'checklist' ? 'Daily Checklist' : 'Compliance Checklist');
    setShowModal(true);
  };

  const handleNtid = async () => {
    setIsVerifying(true);
    const name = await validatingNtid(selectedStore, ntid);
    if (name) {
      setUsername(name.name);
      setNtidverify(true);
      setTimeout(() => {
        setIsVerifying(false);
        setTimeout(() => {
          if (modalContent === 'Daily Checklist') {
            navigate(`/mngevg`);
          } else {
            navigate(`/compliancequestions/${selectedStore}/${ntid}`);
          }
        }, 2000);
      }, 1000);
    } else {
      setError('Invalid NTID / Verification Failed');
      setIsVerifying(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFilteredNtid(false);
    setUsername('');
    setError('');
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'linear-gradient(135deg,rgb(229, 237, 248) 0%,rgba(213, 245, 246, 0.32) 50%,rgba(248, 223, 241, 0.83) 100%)',
      }}
    >
      <Container fluid className="d-flex flex-column p-0 p-md-4 p-lg-4">
        <Button
          className="mt-2 ms-auto btn-lg fw-bolder shadow-lg text-gradient"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        >
          Login <FaArrowCircleRight className="text-success shadow-lg" />
        </Button>
        <HeaderSection
          companyTitle="Techno Communications LLC"
          sectionTitle="Daily Check List & Compliance Check List"
        />
        <Row className="justify-content-center align-items-stretch g-0 g-md-4 g-lg-4 main-content">
          <Col xs={12} md={6} lg={5}>
            <FeatureCard
              icon={FaClipboardList}
              title="Daily Check List"
              description="Organize and track your daily responsibilities efficiently. Stay on top of tasks with our comprehensive checklist system."
              buttonText="View Checklist"
              onClick={() => navigate('/mngevg')}
            />
          </Col>
          <Col xs={12} md={6} lg={5}>
            <FeatureCard
              icon={FaCheckCircle}
              title="Compliance Check List"
              description="Stay compliant with industry regulations and guidelines. Monitor and maintain regulatory requirements effectively."
              buttonText="View Compliance"
              onClick={() => openModal('compliance')}
            />
          </Col>
        </Row>
      </Container>

      <NtidVerificationModal
        show={showModal}
        onHide={handleModalClose}
        title={modalContent}
        ntid={ntid}
        setNtid={setNtid}
        username={username}
        isVerifying={isVerifying}
        error={error}
        filteredNtid={filteredNtid}
        stores={stores}
        searchTerm={searchTerm}
        setSearchTerm={(value) => {
          setSearchTerm(value);
          setSelectedStore(value);
        }}
        selectedStore={selectedStore}
        onVerify={handleNtid}
      />
    </div>
  );
};

export default UserHome;