// Evening.jsx
import React from 'react';
import Checklist from './Checklist';

const Evening = () => {
  return (
    <Checklist 
      title="Evening Check List"
      filterCondition={(item) => item.checklistType === 'Evening Question' && item.isEnabled === 1}
    />
  );
};

export default Evening;