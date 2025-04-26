import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ModeCard from './ModeCard';

const EditModal = ({
  editedDefect,
  onChange,
  onModeChange,
  onModeDelete,
  onAddMode,
  onSubmitEdit,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!editedDefect.defect_name.trim()) {
      alert('Defect name cannot be empty.');
      return;
    }
    setLoading(true);
    onSubmitEdit(editedDefect);
    setLoading(false);
  };

  const handleModeDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this mode? This action cannot be undone.")) {
      onModeDelete(index);
    }
  };

  if (!editedDefect) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Edit Defect</h2>
        <input
          type="text"
          value={editedDefect.defect_name}
          onChange={(e) => onChange({ ...editedDefect, defect_name: e.target.value })}
          disabled={loading}
          aria-label="Defect name"
        />
        <input
          type="file"
          onChange={(e) => onChange({ ...editedDefect, new_pdf_file: e.target.files[0] })}
          disabled={loading}
          aria-label="Upload new PDF"
        />
        {editedDefect.modes.map((mode, index) => (
          <ModeCard
            key={index}
            mode={mode}
            onChange={(updatedMode) => onModeChange(index, updatedMode)}
            onDelete={() => handleModeDelete(index)}
            disabled={loading}
          />
        ))}
        <button onClick={onAddMode} disabled={loading} aria-label="Add new mode">Add Mode</button>
        <div className="actions">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  editedDefect: PropTypes.shape({
    id: PropTypes.number.isRequired,
    defect_name: PropTypes.string.isRequired,
    pdf_filename: PropTypes.string,
    new_pdf_file: PropTypes.object,
    modes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        mode_name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        image_filename: PropTypes.string,
        new_image_file: PropTypes.object
      })
    ).isRequired,
  }),
  onChange: PropTypes.func.isRequired,
  onModeChange: PropTypes.func.isRequired,
  onModeDelete: PropTypes.func.isRequired,
  onAddMode: PropTypes.func.isRequired,
  onSubmitEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditModal;
