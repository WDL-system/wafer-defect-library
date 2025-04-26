import React from 'react';
import PropTypes from 'prop-types';
import DefectCard from './DefectCard';

const DefectTable = ({ defects, onEdit, onDelete, isLoading }) => {
  return (
    <div className="defect-table">
      {isLoading ? (
        <p>Loading defects...</p>
      ) : defects.length === 0 ? (
        <p>No defects found. Try a different search or upload a new defect.</p>
      ) : (
        defects.map((defect) => (
          <DefectCard
            key={defect.id}
            defect={defect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
};

DefectTable.propTypes = {
  defects: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default DefectTable;
