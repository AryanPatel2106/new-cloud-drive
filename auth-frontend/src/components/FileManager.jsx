import { useState, useEffect } from 'react';
import {
  Upload,
  FolderOpen,
  Search,
  Pencil,
  Trash2,
  FileText,
  Image,
  Film,
  Music,
  FileArchive,
  File,
  Check,
  X,
  CloudUpload,
} from 'lucide-react';
import api from '../api/axios';
import Alert from './Alert';
import Spinner from './Spinner';

function getFileIcon(mimeType) {
  if (!mimeType) return File;
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Film;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return FileArchive;
  if (mimeType.includes('text/') || mimeType.includes('javascript') || mimeType.includes('json')) return FileText;
  return File;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FileManager() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const showNotification = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/files');
      if (response.data?.success) {
        setFiles(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const dotIndex = file.name.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      setCustomName(baseName);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification('Please select a file to upload.', false);
      return;
    }

    const dotIndex = selectedFile.name.lastIndexOf('.');
    const extension = dotIndex !== -1 ? selectedFile.name.substring(dotIndex) : '';
    const finalName = customName.trim() ? `${customName.trim()}${extension}` : selectedFile.name;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', finalName);

    try {
      setUploading(true);
      setError('');
      const response = await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.success) {
        showNotification('File uploaded successfully!', true);
        setSelectedFile(null);
        setCustomName('');
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
        fetchFiles();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Upload failed. Please try again.', false);
    } finally {
      setUploading(false);
    }
  };

  const handleRenameSubmit = async (fileId) => {
    if (!editingName.trim()) {
      showNotification('File name cannot be empty.', false);
      return;
    }

    try {
      const response = await api.patch(`/files/${fileId}`, { name: editingName.trim() });
      if (response.data?.success) {
        showNotification('File renamed successfully!', true);
        setEditingFileId(null);
        setEditingName('');
        fetchFiles();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to rename file.', false);
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.name}" permanently? This cannot be undone.`)) return;

    try {
      const response = await api.delete(`/files/${file._id}`);
      if (response.data?.success) {
        showNotification('File deleted successfully!', true);
        fetchFiles();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete file.', false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="file-manager">
      {success && <Alert type="success">{success}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <section className="file-card" aria-labelledby="upload-heading">
        <h2 className="file-card-title" id="upload-heading">
          <Upload size={20} aria-hidden="true" /> Upload a file
        </h2>
        <form onSubmit={handleUploadSubmit} className="upload-form">
          <div className="file-drop">
            <label htmlFor="file-input" className="file-drop-label">
              <CloudUpload size={32} color="#0284c7" aria-hidden="true" />
              <span>
                <strong>Click to browse</strong> or drag a file here
              </span>
              <span style={{ fontSize: 12, color: 'var(--slate-400)' }}>Max size: 10 MB</span>
              {selectedFile && (
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate-700)' }}>
                  Selected: {selectedFile.name}
                </span>
              )}
            </label>
            <input type="file" id="file-input" onChange={handleFileChange} required />
          </div>

          {selectedFile && (
            <div className="form-group">
              <label htmlFor="custom-name" className="form-label">Display name (optional)</label>
              <input
                type="text"
                id="custom-name"
                className="form-input"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter a custom file name"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading || !selectedFile}
          >
            {uploading ? <Spinner label="Uploading to cloud…" /> : 'Upload to cloud storage'}
          </button>
        </form>
      </section>

      <section className="file-card" aria-labelledby="files-heading">
        <div className="file-list-header">
          <h2 className="file-card-title" id="files-heading" style={{ marginBottom: 0 }}>
            <FolderOpen size={20} aria-hidden="true" /> Your files
            {!loading && (
              <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--slate-400)' }}>
                ({filteredFiles.length})
              </span>
            )}
          </h2>
          <label className="sr-only" htmlFor="file-search">Search files</label>
          <input
            type="search"
            id="file-search"
            className="search-input"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">
            <Spinner label="Loading your files…" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FolderOpen size={28} aria-hidden="true" />
            </div>
            <p>
              {searchQuery
                ? 'No files match your search.'
                : 'Your drive is empty. Upload your first file above!'}
            </p>
          </div>
        ) : (
          <div className="file-table-wrap">
            <table className="file-table">
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">Name</th>
                  <th scope="col">Size</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => {
                  const IconComponent = getFileIcon(file.mimeType);
                  return (
                    <tr key={file._id}>
                      <td data-label="Type">
                        <span className="file-type-icon">
                          <IconComponent size={18} aria-hidden="true" />
                        </span>
                      </td>
                      <td data-label="Name">
                        {editingFileId === file._id ? (
                          <div className="inline-edit">
                            <input
                              type="text"
                              className="form-input"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                              aria-label="New file name"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => handleRenameSubmit(file._id)}
                              aria-label="Save rename"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              onClick={() => { setEditingFileId(null); setEditingName(''); }}
                              aria-label="Cancel rename"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-name-link"
                          >
                            {file.name}
                          </a>
                        )}
                      </td>
                      <td data-label="Size">{formatBytes(file.size)}</td>
                      <td data-label="Uploaded">{formatDate(file.createdAt)}</td>
                      <td data-label="Actions">
                        <div className="file-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => { setEditingFileId(file._id); setEditingName(file.name); }}
                            disabled={editingFileId === file._id}
                          >
                            <Pencil size={14} aria-hidden="true" /> Rename
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(file)}
                          >
                            <Trash2 size={14} aria-hidden="true" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
