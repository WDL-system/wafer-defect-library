import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function EditModal({ title, children, onCancel, onSave }) {
  const modalRef = useRef(null);
  const saveButtonRef = useRef(null);

  useEffect(() => {
    // Focus on the save button when the modal opens
    if (saveButtonRef.current) {
      saveButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onCancel();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-labelledby={`modal-title-${title.replace(/\s+/g, '-')}`} // Create a unique ID
        ref={modalRef}
      >
        <h3 id={`modal-title-${title.replace(/\s+/g, '-')}`}>{title}</h3>
        {children}
        <div style={{ marginTop: '10px' }}>
          <button onClick={onSave} ref={saveButtonRef}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

EditModal.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditModal;
