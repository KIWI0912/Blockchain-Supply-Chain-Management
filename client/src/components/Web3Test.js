import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import SupplyChainContract from './SupplyChain.json';

function Web3Test() {
  const [status, setStatus] = useState('Connecting...');
  const [details, setDetails] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('🔌 Starting Web3 connection test...');
      setError(null);
      setStatus('Testing connection...');
      
      // 1. 初始化 Web3
      let web3;
      let provider = 'Unknown';
      
      if (window.ethereum) {
        console.log('MetaMask detected, requesting account access...');
        web3 = new Web3(window.ethereum);
        provider = 'MetaMask';
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('MetaMask access granted');
        } catch (err) {
          console.log('MetaMask access denied, falling back to direct connection');
          web3 = new Web3('http://127.0.0.1:7545');
          provider = 'Direct Ganache (MetaMask denied)';
        }
      } else {
        console.log('No MetaMask detected, using direct Ganache connection');
        web3 = new Web3('http://127.0.0.1:7545');
        provider = 'Direct Ganache';
      }

      // 2. 测试连接
      console.log('Testing Web3 connection...');
      const isConnected = await web3.eth.net.isListening();
      if (!isConnected) {
        throw new Error('Cannot connect to blockchain network');
      }

      // 3. 获取网络信息
      const networkId = await web3.eth.net.getId();
      const accounts = await web3.eth.getAccounts();
      const blockNumber = await web3.eth.getBlockNumber();
      
      console.log('Network ID:', networkId);
      console.log('Accounts:', accounts);
      console.log('Block number:', blockNumber);

      // 4. 检查合约部署
      const deployedNetwork = SupplyChainContract.networks[networkId];
      if (!deployedNetwork) {
        throw new Error(`Contract not deployed on network ${networkId}. Available networks: ${Object.keys(SupplyChainContract.networks).join(', ')}`);
      }

      // 5. 初始化合约
      const contract = new web3.eth.Contract(
        SupplyChainContract.abi,
        deployedNetwork.address
      );

      // 6. 验证合约代码
      const code = await web3.eth.getCode(deployedNetwork.address);
      if (code === '0x') {
        throw new Error('No contract code found at address');
      }

      // 7. 测试合约方法
      const methods = Object.keys(contract.methods);
      console.log('Contract methods:', methods);

      setStatus('✅ Connected Successfully!');
      setDetails({
        networkId: networkId.toString(),
        contractAddress: deployedNetwork.address,
        account: accounts[0] || 'No accounts available',
        accountsCount: accounts.length,
        provider: provider,
        blockNumber: blockNumber.toString(),
        contractMethods: methods.length
      });

    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setStatus('❌ Connection Failed');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Web3 Connection Test</h1>
      
      <div style={{ 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        backgroundColor: status.includes('✅') ? '#d4edda' : status.includes('❌') ? '#f8d7da' : '#fff3cd',
        border: `1px solid ${status.includes('✅') ? '#c3e6cb' : status.includes('❌') ? '#f5c6cb' : '#ffeaa7'}`
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Status: {status}</h2>
      </div>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px' 
        }}>
          <h3>❌ Error Details:</h3>
          <p style={{ fontFamily: 'monospace', backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
            {error}
          </p>
          
          <h4>💡 Troubleshooting Steps:</h4>
          <ol>
            <li><strong>Check Ganache:</strong> Make sure Ganache is running on port 7545</li>
            <li><strong>Network Settings:</strong> Ensure Ganache network ID is 5777</li>
            <li><strong>MetaMask Setup:</strong> If using MetaMask, add Ganache network:
              <ul style={{ marginTop: '5px' }}>
                <li>Network Name: Ganache Local</li>
                <li>RPC URL: http://127.0.0.1:7545</li>
                <li>Chain ID: 5777</li>
                <li>Currency Symbol: ETH</li>
              </ul>
            </li>
            <li><strong>Contract Deployment:</strong> Run <code>npm run deploy</code> to redeploy contracts</li>
          </ol>
        </div>
      )}

      {details.networkId && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3>📊 Connection Details:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontFamily: 'monospace' }}>
            <div><strong>Network ID:</strong> {details.networkId}</div>
            <div><strong>Block Number:</strong> {details.blockNumber}</div>
            <div><strong>Provider:</strong> {details.provider}</div>
            <div><strong>Accounts:</strong> {details.accountsCount}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Contract Address:</strong> {details.contractAddress}</div>
            <div style={{ gridColumn: '1 / -1' }}><strong>Active Account:</strong> {details.account}</div>
            <div><strong>Contract Methods:</strong> {details.contractMethods}</div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={testConnection} 
          style={{ 
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          🔄 Test Connection Again
        </button>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h4>ℹ️ How this test works:</h4>
        <ol>
          <li>Detects and connects to Web3 provider (MetaMask or direct Ganache)</li>
          <li>Verifies blockchain network connection</li>
          <li>Checks network ID and account access</li>
          <li>Validates contract deployment and code</li>
          <li>Tests contract method availability</li>
        </ol>
      </div>
    </div>
  );
}

export default Web3Test;
