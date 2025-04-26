import React, { useState } from 'react';
import PropTypes from 'prop-types';

const UploadForm = ({ onUpload }) => {
  const [defectName, setDefectName] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [modes, setModes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const addMode = () => setModes([...modes, { mode_name: '', description: '', image_file: null }]);
  const removeMode = (index) => setModes(modes.filter((_, i) => i !== index));

  const updateMode = (index, updated) => {
    const newModes = [...modes];
    newModes[index] = updated;
    setModes(newModes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (modes.length === 0) {
      alert("Please add at least one mode.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('defect_name', defectName);
    formData.append('pdf_file', pdfFile);
    modes.forEach((mode, i) => {
      formData.append(`modes[${i}][mode_name]`, mode.mode_name);
      formData.append(`modes[${i}][description]`, mode.description);
      formData.append(`modes[${i}][image_file]`, mode.image_file);
    });

    try {
        const response = await fetch('/admin/upload', {
        method: 'POST',
        body: formData
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // const result = await response.json();  // You might want to handle the response
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please check the console for details."); // Provide user feedback
        setIsUploading(false);
        return; // Stop, so the reset does not occur on error
    }


    setDefectName('');
    setPdfFile(null);
    setModes([]);
    setIsUploading(false);
    onUpload();
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <h2>Upload New Defect</h2>
      <input
        type="text"
        placeholder="Defect Name"
        value={defectName}
        onChange={(e) => setDefectName(e.target.value)}
        required
        aria-label="Defect name"
      />
      <input
        type="file"
        onChange={(e) => setPdfFile(e.target.files[0])}
        required
        aria-label="Upload PDF file"
      />
      {modes.map((mode, index) => (
        <div key={index} className="mode-block">
          <input
            type="text"
            placeholder="Mode Name"
            value={mode.mode_name}
            onChange={(e) => updateMode(index, { ...mode, mode_name: e.target.value })}
            required
            aria-label="Mode name"
          />
          <input
            type="text"
            placeholder="Description"
            value={mode.description}
            onChange={(e) => updateMode(index, { ...mode, description: e.target.value })}
            required
            aria-label="Mode description"
          />
          <input
            type="file"
            onChange={(e) => updateMode(index, { ...mode, image_file: e.target.files[0] })}
            required
            aria-label="Upload mode image"
          />
          <button
            type="button"
            onClick={() => removeMode(index)}
            aria-label="Remove this mode"
          >
            Remove Mode
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addMode}
        disabled={isUploading}
        aria-label="Add new mode"
      >
        Add Mode
      </button>
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
};

UploadForm.propTypes = {
    onUpload: PropTypes.func.isRequired,
};

export default UploadForm;
