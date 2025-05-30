import { Dropdown, Form } from 'react-bootstrap';

const FilterDropdown = ({ title, items, filterType, selectedItems, handleFilterChange, clearFilters }) => (
  <Dropdown>
    <Dropdown.Toggle variant="outline-primary" className="w-100">
      {title} ({selectedItems.length} selected)
    </Dropdown.Toggle>
    <Dropdown.Menu style={{ maxHeight: '20rem', overflowY: 'auto', width: '100%' }}>
      <Dropdown.Item onClick={() => clearFilters(filterType)}>
        Clear All
      </Dropdown.Item>
      <Dropdown.Divider />
      {items.map(item => (
        <Dropdown.Item
          key={item}
          onClick={(e) => {
            e.stopPropagation();
            handleFilterChange(filterType, item);
          }}
        >
          <Form.Check
            type="checkbox"
            label={item}
            checked={selectedItems.includes(item)}
            onChange={() => {}}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);

export default FilterDropdown;