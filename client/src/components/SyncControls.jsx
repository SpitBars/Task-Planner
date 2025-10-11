import React, { useState } from 'react';
import QuickAddModal from './QuickAddModal.jsx';

export default function SyncControls({
  auth,
  onLogin,
  onLogout,
  onSync,
  onQuickAdd,
  syncing,
  disabled
}) {
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <div className="actions">
      {auth.authenticated ? (
        <>
          <button
            type="button"
            className="ghost"
            onClick={onSync}
            disabled={disabled}
          >
            {syncing ? 'Syncing…' : 'Sync calendar'}
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => setQuickOpen(true)}
            disabled={disabled}
          >
            Quick event
          </button>
          <div className="profile">
            <span>{auth.name || auth.email}</span>
            <button type="button" onClick={onLogout} className="ghost">
              Sign out
            </button>
          </div>
          <QuickAddModal
            open={quickOpen}
            onClose={() => setQuickOpen(false)}
            onSubmit={onQuickAdd}
          />
        </>
      ) : (
        <button type="button" className="primary" onClick={onLogin}>
          Sign in with Google
        </button>
      )}
    </div>
  );
}
