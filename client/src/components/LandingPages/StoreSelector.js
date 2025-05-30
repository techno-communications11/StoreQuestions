import  { useRef, useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';

const StoreSelector = ({ stores, searchTerm, setSearchTerm, onSelect, disabled }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Remove duplicate stores by address
  const uniqueStores = stores.reduce((acc, current) => {
    const exists = acc.some(store => store.storeaddress === current.storeaddress);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Filter unique stores based on search term
  const filteredStores = uniqueStores.filter(store =>
    store.storeaddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Form.Group className="mb-3 position-relative mt-2">
      <Form.Control
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
        disabled={disabled}
        placeholder="Search for a store address"
      />
      {isDropdownOpen && filteredStores.length > 0 && (
        <div ref={dropdownRef} className="dropdown-menu show position-absolute w-100">
          {filteredStores.map((store, index) => (
            <div
              key={index}
              className="dropdown-item"
              onClick={() => {
                onSelect(store.storeaddress);
                setIsDropdownOpen(false);
              }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
            >
              {store.storeaddress}
            </div>
          ))}
        </div>
      )}
    </Form.Group>
  );
};

export default StoreSelector;