import React from "react";
import ContentLoader from "react-content-loader";

const DashboardTableLoader = () => (
  <ContentLoader
    speed={1}
    width="100%"
    height={400}
    viewBox="0 0 1960 500"
    backgroundColor="#dedfe1"
    foregroundColor="#ecebeb"
    preserveAspectRatio="none"
  >
    <rect x="0" y="0" rx="10" ry="10" width="100%" height="75" />
    <rect x="0" y="95" rx="5" ry="5" width="12%" height="20" />
    <rect x="13%" y="95" rx="5" ry="5" width="20%" height="20" />
    <rect x="34%" y="95" rx="5" ry="5" width="12%" height="20" />
    <rect x="47%" y="95" rx="5" ry="5" width="12%" height="20" />
    <rect x="60%" y="95" rx="5" ry="5" width="20%" height="20" />
    <rect x="81%" y="95" rx="5" ry="5" width="9%" height="20" />
    <rect x="91%" y="95" rx="5" ry="5" width="9%" height="20" />
    {Array.from({ length: 5 }).map((_, i) => (
      <React.Fragment key={i}>
        <rect x="0" y={155 + i * 60} rx="5" ry="5" width="12%" height="20" />
        <rect x="13%" y={155 + i * 60} rx="5" ry="5" width="20%" height="20" />
        <rect x="34%" y={155 + i * 60} rx="5" ry="5" width="12%" height="20" />
        <rect x="47%" y={155 + i * 60} rx="5" ry="5" width="12%" height="20" />
        <rect x="60%" y={155 + i * 60} rx="5" ry="5" width="20%" height="20" />
        <rect x="81%" y={155 + i * 60} rx="5" ry="5" width="9%" height="20" />
        <rect x="91%" y={155 + i * 60} rx="5" ry="5" width="9%" height="20" />
      </React.Fragment>
    ))}
  </ContentLoader>
);

export default DashboardTableLoader;
