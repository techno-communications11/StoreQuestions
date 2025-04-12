// Morning.jsx
import React from 'react';
import Checklist from './Checklist';

const Morning = () => {
  return (
    <Checklist 
      title="Morning Check List"
      filterCondition={(item) => item.checklistType === 'Morning Question' && item.isEnabled === 1}
    />
  );
};

export default Morning;