import React from 'react';

export const BillingInvoicesViewer: React.FC = () => {
  return (
    <div style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
        Billing Invoices history
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px', color: '#888' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #222' }}>
          <span>Invoice #INV-901</span>
          <span>$120.00 PAID</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span>Invoice #INV-802</span>
          <span>$120.00 PAID</span>
        </div>
      </div>
    </div>
  );
};
export default BillingInvoicesViewer;
