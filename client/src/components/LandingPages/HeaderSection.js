import React from 'react';

const HeaderSection = ({ companyTitle, sectionTitle }) => (
  <div className="header-section text-center mt-0 mt-md-4 mt-lg-4">
    <h2 className="company-title fw-bold text-gradient mb-0 fs-1 fs-md-1 fs-lg-1 mt-4 mt-md-0 mt-lg-0">
      {companyTitle}
    </h2>
    <div className="header-divider"></div>
    <h3 className="section-title fw-bold">{sectionTitle}</h3>
  </div>
);

export default HeaderSection;