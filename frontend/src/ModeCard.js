import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const ModeCard = ({ mode, triggerRefresh }) => {
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(mode.description);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
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

  const updateMode = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const form = new FormData();
      form.append('description', description);
      if (newImage) form.append('image', newImage);

      const response = await fetch(`/defect/mode/${mode.id}`, {
        method: 'PUT',
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Failed to update mode: ${response.status}`);
      }
      setEditing(false);
      setNewImage(null); // Clear newImage after successful upload
      setImagePreview(null);
      triggerRefresh();
    } catch (err) {
      setError(err.message || 'Failed to update mode.');
    } finally {
      setLoading(false);
    }
  }, [description, newImage, mode.id, triggerRefresh]);

  const deleteMode = useCallback(async () => {
    if (window.confirm('Delete this mode?')) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/defect/mode/${mode.id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`Failed to delete mode: ${response.status}`);
        }
        triggerRefresh();
      } catch (err) {
        setError(err.message || 'Failed to delete mode.');
      } finally {
        setLoading(false);
      }
    }
  }, [mode.id, triggerRefresh]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mode-card">
      {!editing ? (
        <>
          <p>{mode.description}</p>
          <img src={mode.image_url} alt={`Mode: ${mode.description}`} style={{ maxWidth: '100px' }} />
          <div>
            <button onClick={() => setEditing(true)} disabled={loading}>
              Edit
            </button>
            <button onClick={deleteMode} disabled={loading}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            updateMode();
          }}
        >
          <label>
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <img
              src={imagePreview}
              alt="Image Preview"
              style={{ maxWidth: '100px' }}
            />
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => {setEditing(false); setError(null);}} disabled={loading}>
            Cancel
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      )}
    </div>
  );
};

ModeCard.propTypes = {
  mode: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    image_url: PropTypes.string,
  }).isRequired,
  triggerRefresh: PropTypes.func.isRequired,
};

export default ModeCard;
