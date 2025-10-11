import { useRef, useState } from 'react';
import { useTasks } from '../context/TaskContext';
import '../styles/data-toolbar.css';

const DataToolbar = () => {
  const { exportTasksAsCsv, exportTasksAsJson, importFromCsv, importFromJson } = useTasks();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportJson = () => {
    exportTasksAsJson();
    setMessage('Tasks exported as JSON.');
    setError(null);
  };

  const handleExportCsv = () => {
    exportTasksAsCsv();
    setMessage('Tasks exported as CSV.');
    setError(null);
  };

  const handleImportClick = () => {
    setMessage(null);
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    try {
      if (file.name.endsWith('.json')) {
        importFromJson(text);
        setMessage('Tasks imported from JSON.');
      } else if (file.name.endsWith('.csv')) {
        importFromCsv(text);
        setMessage('Tasks imported from CSV.');
      } else {
        throw new Error('Unsupported file type. Please use .json or .csv.');
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import tasks.');
      setMessage(null);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="data-toolbar section-card">
      <div className="data-toolbar__actions">
        <button type="button" className="secondary" onClick={handleExportJson}>
          Export JSON
        </button>
        <button type="button" className="secondary" onClick={handleExportCsv}>
          Export CSV
        </button>
        <button type="button" className="primary" onClick={handleImportClick}>
          Import tasks
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileChange}
          hidden
        />
      </div>
      {message && <p className="feedback success">{message}</p>}
      {error && <p className="feedback error">{error}</p>}
    </div>
  );
};

export default DataToolbar;
