import React, { useEffect, useState } from 'react';
import { 
  FaLock, 
  FaEnvelope, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa';
// import { useMyContext } from '../MyContext';

const UpdatePassword = () => {
  const [userData, setUserData] = useState({ email: '', password: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
    // const { setStore } = useMyContext();
//    useEffect(()=>{
//     setStore('');
//    },[])

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password reset instructions sent to your email');
      setError('');
      setUserData({ email: '', password: '' });
    } catch (err) {
      setError('Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      backgroundImage: "url(/reset.avif)",
      backgroundSize: "cover", // Ensure the image covers the entire container without distortion
      backgroundPosition: "center", // Ensure the image is centered
      backgroundAttachment: "fixed", // Keeps the image fixed while scrolling
      backgroundRepeat: "no-repeat", // Prevents repetition of the background
      minHeight: "90vh", // Ensures the container takes up the full viewport height
      objectFit: "cover" // Ensures the background image covers the area correctly
    }} className="d-flex align-items-center justify-content-center">
    
      <div  className="card   shadow-lg border-0 col-md-6 col-lg-4">
        <div className="card-body p-4 p-md-5">
          {/* Header Section */}
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
              <FaLock className="text-primary" size={24} />
            </div>
            <h2 className="fw-bold">Reset Password</h2>
            <p className="text-muted">Enter your email and new password below</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handlePasswordReset}>
            <div className="mb-4 position-relative">
              <div className="position-absolute top-50 translate-middle-y ms-3">
                <FaEnvelope className="text-muted" size={18} />
              </div>
              <input
                type="email"
                className="form-control form-control-lg ps-5"
                placeholder="Email address"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4 position-relative">
              <div className="position-absolute top-50 translate-middle-y ms-3">
                <FaLock className="text-muted" size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control form-control-lg ps-5"
                placeholder="New password"
                value={userData.password}
                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y me-2 border-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-muted" size={18} />
                ) : (
                  <FaEye className="text-muted" size={18} />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg mb-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Success Message */}
          {success && (
            <div className="alert alert-success d-flex align-items-center fade show" role="alert">
              <FaCheckCircle className="me-2" size={18} />
              <div>{success}</div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center fade show" role="alert">
              <FaExclamationTriangle className="me-2" size={18} />
              <div>{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;