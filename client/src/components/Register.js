import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useMarkets from "../components/useMarkets ";
import Lottie from "lottie-react";
import Animation from "./RegisterAnimation.json";
import { Col } from 'react-bootstrap';
const Register = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    districtManagerName: '',  // Added for district manager role
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { markets, loading, errormarket } = useMarkets();

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log(userData)
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.status === 201) {
        setSuccess('Registration successful! Please login.');
        setTimeout(() => setSuccess(''), 3000);
        setError('');
        setUserData({
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          districtManagerName: '',
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (errormarket) return <p>Error: {errormarket}</p>;

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      {success && <div className="alert alert-success alert-dismissible mt-5"><strong>{success}</strong></div>}

      <div className="ms-2 rounded me-2 mb-1"
        style={{
          backgroundImage: "url(/register.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "150px",
          width: "99.5%",
          opacity: "0.9",
        }}
      >
        <h4 className="text-white mb-1 fs-1 text-center pt-5">
          Register User
        </h4>
      </div>

      <div className="container-fluid d-flex gap-5 justify-content-around align-items-center">
        <div className="row w-100 justify-content-center p-5"
          style={{
            background: "linear-gradient(135deg,rgb(229, 237, 248) 0%,rgba(213, 245, 246, 0.32) 50%,rgba(248, 223, 241, 0.83) 100%)",
          }}
        >

          <div className="col-lg-3 me-5 col-md-3 mb-4 d-flex justify-content-center align-items-center">
            <Lottie
              className="mb-3"
              autoplay
              loop
              animationData={Animation}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
          <Col className='col-md-5'>
            <div className="card shadow-lg border-0 rounded-lg"    xs={12} // Full width on extra small screens
            md={8}// 1/3 width on medium screens
            lg={8}//1/3 width on large screens
            >
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <h4 className="mb-3 text-center text-dark">Create Account</h4>

                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control shadow-none border"
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <select
                      className="form-select shadow-none border"
                      id="role"
                      name="role"
                      value={userData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="district_manager">District Manager</option>
                      <option value="market_manager">Market Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Additional input if role is district manager */}
                  {userData.role === 'district_manager' && (
                    <>
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control shadow-none border"
                          id="districtManagerName"
                          name="districtManagerName"
                          value={userData.districtManagerName}
                          onChange={handleChange}
                          placeholder="Enter Name"
                          required
                        />
                      </div>


                    </>
                  )}

                  {userData.role === 'market_manager' && (
                    <div className="mb-3">
                      <select
                        className="form-select shadow-none border"
                        id="market"
                        name="market"
                        value={userData.market}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Market</option>
                        {markets.map((market, index) => (
                          <option key={index} value={market.market}>
                            {market.market}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control shadow-none border"
                        id="password"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary shadow-none border"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control shadow-none border"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 text-white mt-2">
                    Register
                  </button>
                </form>
              </div>
            </div>
            </Col>
        </div>
      </div>
    </div>
  );
};

export { Register };
