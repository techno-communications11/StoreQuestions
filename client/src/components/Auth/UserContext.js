import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storename, setStorename] = useState(null);
  const [ntidverify, setNtidverify] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/user/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Send cookie
        });

        if (response.ok) {
          const userData = await response.json();
          const { id, role, email, market, name, ...otherData } = userData;

          if (!id || !role) {
            throw new Error('Invalid user data');
          }

          setUserData({
            id,
            role,
            email,
            market,
            name,
            ...otherData,
          });
          setIsAuthenticated(true);
        } else {
          setUserData(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setUserData(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []); // Run once on mount

  // Don’t render children until auth is verified
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        isAuthenticated,
        setIsAuthenticated,
        storename,
        setStorename,
        ntidverify,
        setNtidverify,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);