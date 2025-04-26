import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './index.css'; // Assuming this contains global styles

import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import DefectTable from './components/DefectTable';
import EditModal from './components/EditModal';

function App() {
  const [defects, setDefects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDefect, setEditingDefect] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchDefects = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/defect/search?query=${encodeURIComponent(query)}`);
      
      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      setDefects(data.defects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch defects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
  }, []);

  const handleSearch = () => {
    fetchDefects(searchQuery);
  };

  const handleUpload = () => {
    fetchDefects();
  };

  const handleEdit = (defect) => {
    setEditingDefect({
      ...defect,
      new_pdf_file: null,
      modes: defect.modes.map(mode => ({
        ...mode,
        new_image_file: null,
      })),
    });
  };

  const handleDelete = async (defectId) => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      try{
        const res = await fetch(`/defect/${defectId}`, { method: 'DELETE' });
        if (!res.ok) {
          throw new Error("Failed to delete defect");
        }
        fetchDefects();
      } catch (error){
        console.error("Error deleting defect", error);
        setError("Failed to delete defect.");
      }
      
    }
  };

  const handleEditChange = (updatedDefect) => {
    setEditingDefect(updatedDefect);
  };

  const handleModeChange = (index, updatedMode) => {
    setEditingDefect(prevEditingDefect => {
      const updatedModes = [...prevEditingDefect.modes];
      updatedModes[index] = updatedMode;
      return { ...prevEditingDefect, modes: updatedModes };
    });
  };

  const handleModeDelete = (index) => {
    setEditingDefect(prevEditingDefect => ({
      ...prevEditingDefect,
      modes: prevEditingDefect.modes.filter((_, i) => i !== index),
    }));
  };

  const handleAddMode = () => {
    setEditingDefect(prevEditingDefect => ({
      ...prevEditingDefect,
      modes: [
        ...prevEditingDefect.modes,
        { mode_name: '', description: '', image_filename: '', new_image_file: null },
      ],
    }));
  };

  const handleSubmitEdit = async () => {
    if (!editingDefect.defect_name || editingDefect.modes.length === 0) {
      alert('Defect must have a name and at least one mode.');
      return;
    }

    const formData = new FormData();
    formData.append('defect_name', editingDefect.defect_name);
    if (editingDefect.new_pdf_file) {
      formData.append('pdf_file', editingDefect.new_pdf_file);
    }

    editingDefect.modes.forEach((mode, i) => {
      formData.append(`modes[${i}][id]`, mode.id || ''); //important to differ new and existing modes
      formData.append(`modes[${i}][mode_name]`, mode.mode_name);
      formData.append(`modes[${i}][description]`, mode.description);
      if (mode.new_image_file) {
        formData.append(`modes[${i}][image_file]`, mode.new_image_file);
      }
    });

    try{
      setLoading(true);
      setError(null);
      const res = await fetch(`/defect/${editingDefect.id}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok){
        throw new Error("Failed to update the defect");
      }
      setEditingDefect(null);
      fetchDefects();
    } catch(error){
      console.error("Error updating defect", error);
      setError("Failed to update defect");
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="App">
      <h1>Wafer Defect Library System</h1>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
      />

      <UploadForm onUpload={handleUpload} />
      
      <h2>Defect List</h2>

      {loading && <p style={{ color: 'blue' }}>Loading defects...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <DefectTable
        defects={defects}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditModal
        editedDefect={editingDefect}
        onChange={handleEditChange}
        onModeChange={handleModeChange}
        onModeDelete={handleModeDelete}
        onAddMode={handleAddMode}
        onSubmitEdit={handleSubmitEdit}
        onClose={() => setEditingDefect(null)}
      />
    </div>
  );
}

App.propTypes = {
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
  ),
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  editingDefect: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

export default App;
