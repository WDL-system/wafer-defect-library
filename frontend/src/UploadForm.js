import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const ModeInputField = ({ mode, onModeChange, index }) => {
  return (
    <div>
      <label htmlFor={`description-${index}`}>Description:</label>
      <input
        id={`description-${index}`}
        type="text"
        placeholder="Description"
        value={mode.description}
        onChange={(e) => onModeChange(index, 'description', e.target.value)}
      />
      <label htmlFor={`image-${index}`}>Image:</label>
      <input
        id={`image-${index}`}
        type="file"
        accept="image/*"
        onChange={(e) => onModeChange(index, 'image', e.target.files[0])}
      />
    </div>
  );
};

ModeInputField.propTypes = {
  mode: PropTypes.shape({
    description: PropTypes.string.isRequired,
    image: PropTypes.object, // File object
  }).isRequired,
  onModeChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

function UploadForm({ onUpload }) {
  const [defectName, setDefectName] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [modes, setModes] = useState([{ description: '', image: null }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleModeChange = useCallback((i, key, value) => {
    const newModes = [...modes];
    newModes[i][key] = value;
    setModes(newModes);
  }, [modes]);

  const addModeField = useCallback(() => {
    setModes([...modes, { description: '', image: null }]);
  }, [modes]);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Form validation
      if (!defectName.trim()) {
        setError('Defect name is required.');
        return;
      }
      if (modes.some((mode) => !mode.description.trim())) {
        setError('All mode descriptions are required.');
        return;
      }

      const form = new FormData();
      form.append('defect_name', defectName);
      if (pdfFile) form.append('pdf_file', pdfFile);
      modes.forEach((mode, i) => {
        form.append(`modes[${i}][description]`, mode.description);
        if (mode.image) form.append(`modes[${i}][image]`, mode.image);
      });

      const response = await onUpload(form);
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      setDefectName('');
      setPdfFile(null);
      setModes([{ description: '', image: null }]);
    } catch (err) {
      setError(err.message || 'Failed to upload defect.');
    } finally {
      setLoading(false);
    }
  }, [defectName, pdfFile, modes, onUpload]);

  return (
    <div className="upload-form">
      <h3>Upload New Defect</h3>
      <label htmlFor="defect-name">Defect Name:</label>
      <input
        id="defect-name"
        type="text"
        placeholder="Defect Name"
        value={defectName}
        onChange={(e) => setDefectName(e.target.value)}
      />
      <label htmlFor="pdf-file">PDF File:</label>
      <input
        id="pdf-file"
        type="file"
        accept="application/pdf"
        onChange={(e) => setPdfFile(e.target.files[0])}
      />

      {modes.map((mode, i) => (
        <ModeInputField
          key={i}
          index={i}
          mode={mode}
          onModeChange={handleModeChange}
        />
      ))}

      <button onClick={addModeField}>+ Add Mode</button>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

UploadForm.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default UploadForm;
