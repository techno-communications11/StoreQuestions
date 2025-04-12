import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import { useUserContext } from './UserContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Optional loading state
  const navigate = useNavigate();
  const { setUserData, setIsAuthenticated } = useUserContext();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Start loading

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const userResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/user/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const userData = await userResponse.json();

        if (userResponse.ok) {
          const { id, role, email, market, name, ...otherData } = userData;

          if (!role || !id) {
            setError('User role or ID not found. Please contact support.');
            return;
          }

          setUserData({ id, role, email: email || credentials.email, market, name, ...otherData });
          setIsAuthenticated(true);

          switch (role) {
            case 'admin':
              navigate('/storedashboard');
              break;
            case 'market_manager':
              navigate('/marketdashboard');
              break;
            case 'district_manager':
              navigate('/dmdashboard');
              break;
            default:
              navigate('/');
              break;
          }
        } else {
          setError(userData.message || `Failed to fetch user data (Status: ${userResponse.status})`);
        }
      } else {
        setError(data.message || `Login failed (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.name === 'TypeError' && err.message.includes('fetch')
          ? 'Unable to connect to the server. Please check your network or try again later.'
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container-fluid min-vh-100 d-flex flex-column justify-content-center position-relative"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f3e7e9 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Shapes */}
      <div
        className="position-absolute"
        style={{
          top: '-10%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'rgba(225, 1, 116, 0.1)',
          borderRadius: '50%',
          transform: 'rotate(45deg)',
        }}
      />
      <div
        className="position-absolute"
        style={{
          bottom: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'rgba(225, 1, 116, 0.05)',
          borderRadius: '50%',
          transform: 'rotate(-45deg)',
        }}
      />

      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center me-2 mb-5"
        style={{
          color: '#E10174',
          fontWeight: 'bold',
          fontSize: '4rem',
          letterSpacing: '2px',
          textShadow: '2px 2px 4px rgba(225, 1, 116, 0.1)',
        }}
      >
        Welcome Back ..
      </motion.h1>

      <div className="row w-100 m-0">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center"
        >
          <motion.img transition={{ type: 'spring', stiffness: 300 }} src="logoT.webp" alt="Logo" className="img-fluid w-100" />
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-md-6 d-flex justify-content-center align-items-center p-1 mt-3"
        >
          <Col xs={12} md={8} lg={8} className="card shadow-lg rounded-4 mt-xs-4">
            <div
              className="card shadow-lg rounded-3"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(225, 1, 116, 0.1)',
              }}
            />
            <div className="card-body p-4">
              {error && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="alert alert-danger">
                  {error}
                </motion.div>
              )}
              <form onSubmit={handleSubmit}>
                <h4 className="mb-4 text-center text-dark" style={{ color: '#E10174' }}>
                  Login to Your Account
                </h4>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control shadow-none"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                    style={{ borderColor: '#E10174', borderRadius: '20px', padding: '12px 15px' }}
                    disabled={loading}
                  />
                </div>
                <div className="mb-1 position-relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control shadow-none"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    style={{ borderColor: '#E10174', borderRadius: '20px', padding: '12px 45px 12px 15px' }}
                    disabled={loading}
                  />
                  <motion.span
                    className="position-absolute end-0 me-3"
                    style={{ cursor: 'pointer', color: '#E10174', bottom: '1rem' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn text-white w-100 mt-3 mb-3"
                  style={{
                    backgroundColor: '#E10174',
                    borderColor: '#E10174',
                    borderRadius: '25px',
                    padding: '12px',
                    boxShadow: '0 10px 20px rgba(225, 1, 116, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </form>
            </div>
          </Col>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;