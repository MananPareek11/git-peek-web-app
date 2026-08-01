import React, { useState } from 'react';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';
import { generateGithubPdf } from '../../utils/pdfGenerator';
import styles from './ExportPdfButton.module.css';

export const ExportPdfButton = ({ userData, reposData }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!userData) return;
    setExporting(true);
    try {
      await generateGithubPdf(userData, reposData || []);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      className={styles.pdfButton}
      disabled={exporting}
      title="Export GitHub Summary PDF"
    >
      {exporting ? (
        <>
          <FaSpinner className={styles.spinner} />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FaFilePdf className={styles.pdfIcon} />
          <span>Export Summary PDF</span>
        </>
      )}
    </button>
  );
};

export default ExportPdfButton;
