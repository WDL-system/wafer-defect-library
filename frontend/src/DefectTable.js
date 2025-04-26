import React from 'react';
import PropTypes from 'prop-types';
import DefectCard from './DefectCard'; // Import DefectCard

function DefectTable({ defects, triggerRefresh }) {
  return (
    <div className="defect-table">
      <h2>Defect Results</h2>

      {/* Loading state is handled by the parent component */}
      {!defects && <p>Loading defects...</p>}

      {/* Error message is displayed, but the parent should set it */}
      {/* error && <p className="error">{error}</p> */}

      {defects?.length === 0 && !loading ? (
        <p>No defects found. Try a different search keyword or upload a new defect.</p>
      ) : (
        defects?.map((defect) => (
          <DefectCard
            key={defect.id}
            defect={defect}
            triggerRefresh={triggerRefresh}
          />
        ))
      )}
    </div>
  );
}

DefectTable.propTypes = {
  defects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      // Add other relevant props for a defect
    })
  ),
  triggerRefresh: PropTypes.func.isRequired,
};

export default DefectTable;
