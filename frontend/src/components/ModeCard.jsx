import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

const ModeCard = ({ mode, onChange, onDelete }) => {
  return (
    <div className="mode-card">
      <input
        type="text"
        value={mode.mode_name}
        onChange={(e) => onChange({ ...mode, mode_name: e.target.value })}
        placeholder="Mode name"
        aria-label="Mode name"
        required
      />
      <input
        type="text"
        value={mode.description}
        onChange={(e) => onChange({ ...mode, description: e.target.value })}
        placeholder="Description"
        aria-label="Mode description"
        required
      />
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files[0];
          onChange({ ...mode, new_image_file: file });
        }}
        aria-label="Upload mode image"
        required
      />
      {mode.image_filename && (
        <img
          src={`/images/${mode.image_filename}`}
          alt={`Mode: ${mode.mode_name}`}
          className="mode-image-preview"
        />
      )}
      <button onClick={onDelete} aria-label="Delete this mode">
        Delete Mode
      </button>
    </div>
  );
};

// Prop validation with PropTypes
ModeCard.propTypes = {
  mode: PropTypes.shape({
    id: PropTypes.number.isRequired,
    mode_name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image_filename: PropTypes.string,
    new_image_file: PropTypes.object, // Added for the new file
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ModeCard;
