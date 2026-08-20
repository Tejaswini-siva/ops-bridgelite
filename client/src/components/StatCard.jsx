import React from 'react';

export default function StatCard({ label, value, icon: Icon, variant = 'blue' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper stat-icon-${variant}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
