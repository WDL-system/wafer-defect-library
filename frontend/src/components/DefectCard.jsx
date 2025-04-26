import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

const DefectCard = ({ defect, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this defect? This action cannot be undone.")) {
      setLoading(true);
      onDelete(defect.id);
      setLoading(false);
    }
  };

  return (
    <div className="defect-card">
      <h2>{defect.defect_name}</h2>
      <a
        className="pdf-link"
        href={`/pdfs/${defect.pdf_filename}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View defect PDF"
      >
        View PDF
      </a>

      {defect.modes.map((mode) => (
        <div key={mode.id} className="mode-card">
          <p>
            <strong>Mode:</strong> {mode.mode_name}
          </p>
          <p>
            <strong>Description:</strong> {mode.description}
          </p>
          <img
            src={`/images/${mode.image_filename}`}
            alt={`Mode: ${mode.mode_name}`}
          />
        </div>
      ))}

      <div className="actions">
        <button onClick={() => onEdit(defect)} disabled={loading} aria-label="Edit defect">
          Edit Defect
        </button>
        <button onClick={handleDelete} disabled={loading} aria-label="Delete defect">
          {loading ? 'Deleting...' : 'Delete Defect'}
        </button>
      </div>
    </div>
  );
};

// Prop validation with PropTypes
DefectCard.propTypes = {
  defect: PropTypes.shape({
    id: PropTypes.number.isRequired,
    defect_name: PropTypes.string.isRequired,
    pdf_filename: PropTypes.string,
    modes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        mode_name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        image_filename: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DefectCard;
