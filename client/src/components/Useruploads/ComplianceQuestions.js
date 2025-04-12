// ComplianceQuestions.jsx
import React from 'react';
import Checklist from './Checklist';

const ComplianceQuestions = () => {
  return (
    <Checklist 
      title="Compliance Check List"
      filterCondition={(item) => item.type === 'Compliance Question' && item.isEnabled === 1}
    />
  );
};

export default ComplianceQuestions;