import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { adminAPI } from '../services/apiService';
import './FileUpload.css';

const FileUpload = ({ onUploadComplete, acceptedTypes = {}, maxSize = 104857600, multiple = false }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => ({
        name: file.name,
        errors: errors.map((e) => e.message).join(', '),
      }));
      alert(`Some files were rejected:\n${errors.map((e) => `${e.name}: ${e.errors}`).join('\n')}`);
    }

    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      id: Math.random().toString(36).substring(7),
    }));

    setFiles((prev) => (multiple ? [...prev, ...newFiles] : newFiles));
  }, [multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple,
  });

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }

    setUploading(true);

    try {
      const uploadedFiles = [];

      for (const fileObj of files) {
        const formData = new FormData();
        formData.append('file', fileObj.file);

        // Simulate progress (since axios doesn't easily expose upload progress in this setup)
        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 0 }));

        const response = await adminAPI.uploadFile(formData);

        if (response.data.success) {
          uploadedFiles.push({
            name: fileObj.file.name,
            url: response.data.data.url,
            type: fileObj.file.type,
          });
          setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 100 }));
        }
      }

      // Clear files and notify parent component
      setFiles([]);
      setUploadProgress({});

      if (onUploadComplete) {
        onUploadComplete(uploadedFiles);
      }

      alert('Files uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <div className="dropzone-content">
          <div className="dropzone-icon">📁</div>
          {isDragActive ? (
            <p className="dropzone-text">Drop files here...</p>
          ) : (
            <>
              <p className="dropzone-text">Drag & drop files here, or click to browse</p>
              <p className="dropzone-subtext">
                Max size: {formatFileSize(maxSize)}
                {multiple && ' • Multiple files allowed'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* File Preview Grid */}
      {files.length > 0 && (
        <div className="files-preview">
          <h4>Selected Files ({files.length})</h4>
          <div className="preview-grid">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="file-preview-card">
                {fileObj.preview ? (
                  <div className="file-thumbnail">
                    <img src={fileObj.preview} alt={fileObj.file.name} />
                  </div>
                ) : (
                  <div className="file-icon-preview">
                    <span className="file-type-icon">{getFileIcon(fileObj.file.type)}</span>
                  </div>
                )}

                <div className="file-info">
                  <div className="file-name" title={fileObj.file.name}>
                    {fileObj.file.name.length > 30
                      ? `${fileObj.file.name.substring(0, 30)}...`
                      : fileObj.file.name}
                  </div>
                  <div className="file-size">{formatFileSize(fileObj.file.size)}</div>
                </div>

                {uploadProgress[fileObj.id] !== undefined && (
                  <div className="upload-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress[fileObj.id]}%` }}
                    />
                  </div>
                )}

                {!uploading && (
                  <button
                    className="btn-remove-file"
                    onClick={() => removeFile(fileObj.id)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button
              className="btn-clear-all"
              onClick={() => setFiles([])}
              disabled={uploading}
            >
              Clear All
            </button>
            <button
              className="btn-upload"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Default accepted types
FileUpload.defaultProps = {
  acceptedTypes: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'video/*': ['.mp4', '.avi', '.mov'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize: 104857600, // 100MB
  multiple: true,
};

export default FileUpload;
