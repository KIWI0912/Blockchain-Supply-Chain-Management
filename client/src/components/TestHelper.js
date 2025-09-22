import React, { useState } from 'react';

function TestHelper() {
  const [showAddresses, setShowAddresses] = useState(false);
  
  const ganacheAddresses = [
    '0x627306090abaB3A6e1400e9345bC60c78a8BEf57',
    '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
    '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
    '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544',
    '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
    '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
    '0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5',
    '0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5',
    '0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc',
    '0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE'
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <button
        onClick={() => setShowAddresses(!showAddresses)}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        }}
      >
        🧪 Test Addresses
      </button>
      
      {showAddresses && (
        <div style={{
          position: 'absolute',
          bottom: '60px',
          right: '0',
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0',
          minWidth: '400px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h4 style={{ 
            margin: '0 0 15px 0', 
            color: '#2d3748',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📋 Ganache Test Addresses
          </h4>
          <p style={{ 
            margin: '0 0 15px 0', 
            fontSize: '12px', 
            color: '#718096' 
          }}>
            Copy these addresses for testing product transfers:
          </p>
          {ganacheAddresses.map((address, index) => (
            <div key={address} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: index % 2 === 0 ? '#f8f9fa' : 'white',
              borderRadius: '6px',
              marginBottom: '4px'
            }}>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '600',
                color: '#667eea',
                minWidth: '20px'
              }}>
                #{index + 1}
              </span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '11px',
                color: '#4a5568',
                flex: 1
              }}>
                {address}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                style={{
                  padding: '4px 8px',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  color: '#4a5568'
                }}
                title="Copy address"
              >
                📋
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestHelper;
