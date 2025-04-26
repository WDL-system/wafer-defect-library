import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">{children}</div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

function DefectCard({ defect, triggerRefresh }) {
  const [editingName, setEditingName] = useState(defect.name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newPdf, setNewPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup the image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const updateDefectData = useCallback(async (endpoint, formData, successMessage) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(endpoint, { method: 'PUT', body: formData });
      if (!response.ok) {
        throw new Error(`Failed to update data: ${response.status}`);
      }
      triggerRefresh();
      alert(successMessage); // basic feedback
    } catch (err) {
      console.error(err);
      setError(`Failed to ${successMessage.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [triggerRefresh]);

  const updateName = () => {
    if (!editingName.trim()) {
      alert('Defect name cannot be empty.');
      return;
    }
    const form = new FormData();
    form.append('defect_name', editingName);
    updateDefectData(`/defect/${defect.id}`, form, 'Update defect name');
  };

  const updatePDF = () => {
    if (!newPdf) {
      alert('Please select a PDF file to upload.');
      return;
    }
    const form = new FormData();
    form.append('pdf_file', newPdf);
    updateDefectData(`/defect/${defect.id}`, form, 'Upload PDF').then(() => {
      setNewPdf(null);
    });
  };

  const deleteDefect = async () => {
    if (!window.confirm('Are you sure you want to delete this defect?')) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/defect/${defect.id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete defect: ${response.status}`);
      }
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting defect:', err);
      setError('Failed to delete defect.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addMode = async () => {
    if (!newDescription.trim() || !newImage) {
      alert('Please provide both a description and an image.');
      return;
    }

    const form = new FormData();
    form.append('description', newDescription);
    form.append('image', newImage);

     try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/defect/mode/${defect.id}`, {
        method: 'POST',
        body: form,
      });
      if (!response.ok) {
        throw new Error(`Failed to add mode: ${response.status}`);
      }
      setNewDescription('');
      setNewImage(null);
      setImagePreview(null);
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error('Error adding mode:', err);
      setError('Failed to add new defect mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="defect-card">
      <div>
        <label>
          Defect Name:
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            disabled={loading}
          />
        </label>
        <button onClick={updateName} disabled={loading}>
          Update Name
        </button>
      </div>

      <div>
        <label>
          Replace PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setNewPdf(e.target.files[0])}
            disabled={loading}
          />
        </label>
        <button onClick={updatePDF} disabled={loading}>
          Upload PDF
        </button>
      </div>

      <div>
        <button onClick={deleteDefect} disabled={loading}>
          Delete Defect
        </button>
      </div>

      {defect.pdf_url && (
        <div style={{ marginTop: '10px' }}>
          <a href={defect.pdf_url} target="_blank" rel="noopener noreferrer">
            📄 View PDF
          </a>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="mode-list">
        {defect.modes.map((mode) => (
          <ModeCard key={mode.id} mode={mode} triggerRefresh={triggerRefresh} />
        ))}
      </div>

      <div>
        <button onClick={() => setIsModalOpen(true)} disabled={loading}>
          + Add New Mode
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h4>Add New Mode</h4>
        <label>
          Description:
          <input
            type="text"
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={loading}
          />
        </label>
        <label>
          Image:
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </label>
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="image-preview" />
        )}
        <div style={{ marginTop: '10px' }}>
          <button onClick={addMode} disabled={loading}>
            Save
          </button>
          <button onClick={() => setIsModalOpen(false)} disabled={loading}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

DefectCard.propTypes = {
  defect: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    pdf_url: PropTypes.string,
    modes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        image_url: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  triggerRefresh: PropTypes.func.isRequired,
};

export default DefectCard;
