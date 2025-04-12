import React, {  useEffect } from 'react';
import useMarkets from '../Utils/useMarkets ';
import './Styles/MultipleMarketSelect.css'; // Import your CSS file for styling
import { Dropdown } from 'react-bootstrap';

const MultipleMarketSelect = ({ selectedMarkets, setSelectedMarkets }) => {
  const { markets } = useMarkets();
  console.log('Markets:', markets, 'Selected Markets:', selectedMarkets);

  // Sync initial selectedMarkets with props on mount
  useEffect(() => {
    const validSelectedMarkets = selectedMarkets.filter(name =>
      markets.some(market => market.market === name)
    );
    if (validSelectedMarkets.length !== selectedMarkets.length) {
      setSelectedMarkets(validSelectedMarkets);
    }
  }, [markets, selectedMarkets, setSelectedMarkets]);

  // Handle individual market selection
  const handleMarketClick = (marketName) => {
    console.log('Toggling market:', marketName);
    if (selectedMarkets.includes(marketName)) {
      setSelectedMarkets(selectedMarkets.filter(name => name !== marketName));
    } else {
      setSelectedMarkets([...selectedMarkets, marketName]);
    }
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    if (markets.length === selectedMarkets.length) {
      setSelectedMarkets([]);
    } else {
      setSelectedMarkets(markets.map(market => market.market));
    }
  };

  return (
    <Dropdown drop="up">
      <Dropdown.Toggle variant="outline-primary" className="w-100">
        Markets ({selectedMarkets.length} selected)
      </Dropdown.Toggle>

      <Dropdown.Menu
        className="custom-dropdown-menu"
        style={{ maxHeight: '20rem', overflowY: 'auto', width: '100%' }}
        placement="top-start"
      >
        <Dropdown.Item onClick={handleSelectAll}>
          Select All
          {markets.length > 0 && selectedMarkets.length === markets.length && (
            <span style={{ color: 'green', marginLeft: '10px' }}>✔</span>
          )}
        </Dropdown.Item>

        <Dropdown.Divider />

        {markets.map((market) => (
          <Dropdown.Item
            key={market.id}
            onClick={(e) => {
              e.stopPropagation();
              handleMarketClick(market.market);
            }}
            style={{
              backgroundColor: selectedMarkets.includes(market.market) ? 'green' : 'transparent', // Light blue for selected
              cursor: 'pointer',
            }}
            active={selectedMarkets.includes(market.market)} // Optional: Use Bootstrap's active style
          >
            {market.market}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MultipleMarketSelect;