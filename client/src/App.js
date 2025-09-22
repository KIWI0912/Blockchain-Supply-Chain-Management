import React, { useState } from 'react';
import SupplyChainApp from './components/SupplyChainApp';
import Web3Test from './components/Web3Test';
import TestHelper from './components/TestHelper';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('app'); // 'app' or 'test'

  return (
    <div className="App">
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setCurrentView('app')}
          style={{
            padding: '10px 18px',
            background: currentView === 'app' ? 
              'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 
              'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: currentView === 'app' ? 
              '0 4px 15px rgba(72, 187, 120, 0.4)' : 
              '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          📦 Supply Chain App
        </button>
        <button
          onClick={() => setCurrentView('test')}
          style={{
            padding: '10px 18px',
            background: currentView === 'test' ? 
              'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)' : 
              'linear-gradient(135deg, #a0aec0 0%, #718096 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: currentView === 'test' ? 
              '0 4px 15px rgba(66, 153, 225, 0.4)' : 
              '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          🧪 Connection Test
        </button>
      </div>

      {currentView === 'app' ? <SupplyChainApp /> : <Web3Test />}
      
      {/* 只在供应链应用页面显示测试助手 */}
      {currentView === 'app' && <TestHelper />}
    </div>
  );
}

export default App;
