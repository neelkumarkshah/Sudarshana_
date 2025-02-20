import React, { createContext, useState } from "react";

export const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const [scanData, setScanData] = useState([]);

  const addScanData = (entry) => {
    setScanData((prevData) => [...prevData, entry]);
  };

  return (
    <ScanContext.Provider value={{ scanData, addScanData }}>
      {children}
    </ScanContext.Provider>
  );
};
