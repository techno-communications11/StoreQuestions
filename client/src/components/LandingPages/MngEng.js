import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import validatingNtid from './Validatingntid';
import fetchStores from '../Utils/fetchStores';
import getntid from '../Utils/getntid';
import { useUserContext } from '../Auth/UserContext';
import HeaderSection from './HeaderSection';
import FeatureCard from './FeatureCard';
import NtidVerificationModal from './NtidVerificationModal';
import './Styles/UserHome.css';

const MngEvg = () => {
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

   console.log("stores",stores)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesData, ntidsData] = await Promise.all([fetchStores(), getntid()]);
        
        if (storesData.error) {
          setError(storesData.error);
        } else {
          // Filter stores by ntid if needed, but only after user input
          setStores(storesData);
        }

        if (ntidsData.error) {
          setError(ntidsData.error);
        } else {
          setNtidsdata(ntidsData.map((store) => store.ntid));
        }
      } catch (err) {
        setError('Failed to fetch data');
      }
    };

    fetchData();
  }, []); // No dependency on ntid here since initial fetch doesn't filter by it

  useEffect(() => {
    setFilteredNtid(ntidsdata.includes(ntid));
  }, [ntid, ntidsdata]);

  const openModal = (type) => {
    setError('');
    setModalContent(type === 'checklist' ? 'Morning Check List' : 'Evening Checklist List');
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
          if (modalContent === 'Morning Check List') {
            navigate('/morning');
          } else {
            navigate('/questions');
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

  const handleStoreSelect = (store) => {
    setSearchTerm(store);
    setSelectedStore(store);
  };

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'linear-gradient(135deg,rgb(239, 248, 229) 0%,rgba(213, 245, 246, 0.32) 50%,rgba(248, 223, 241, 0.83) 100%)',
      }}
    >
      <Container fluid className="d-flex flex-column p-0 p-md-4 p-lg-4">
        <HeaderSection
          companyTitle="Techno Communications LLC"
          sectionTitle="Morning Check List & Evening Check List"
        />
        <Row className="justify-content-center align-items-stretch g-2 g-md-4 g-lg-4 main-content">
          <Col md={6} lg={5}>
            <FeatureCard
              icon={FaClipboardList}
              title="Morning Check List"
              description="Organize and track your daily Morning responsibilities efficiently. Stay on top of tasks with our comprehensive checklist system."
              buttonText="View Morning Check List"
              onClick={() => openModal('checklist')}
            />
          </Col>
          <Col md={6} lg={5}>
            <FeatureCard
              icon={FaCheckCircle}
              title="Evening Check List"
              description="Organize and track your daily Evening responsibilities efficiently. Stay on top of tasks with our comprehensive checklist system."
              buttonText="View Evening Check List"
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
        setSearchTerm={handleStoreSelect} // Simplified callback
        selectedStore={selectedStore}
        onVerify={handleNtid}
      />
    </div>
  );
};

export default MngEvg;