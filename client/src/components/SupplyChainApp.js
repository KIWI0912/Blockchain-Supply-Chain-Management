import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function SupplyChainApp() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  
  // 产品相关状态
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: ''
  });
  
  // 供应商相关状态
  const [suppliers, setSuppliers] = useState([]);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    location: '',
    contact: ''
  });
  
  // 交易相关状态
  const [transactions, setTransactions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transferAddress, setTransferAddress] = useState('');

  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    try {
      setStatus('🔌 Connecting to blockchain...');
      
      // 初始化 Web3
      let web3Instance;
      if (window.ethereum) {
        web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.log('MetaMask access denied, using direct connection');
          web3Instance = new Web3('http://127.0.0.1:7545');
        }
      } else {
        web3Instance = new Web3('http://127.0.0.1:7545');
      }

      // 获取账户
      const accounts = await web3Instance.eth.getAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }

      // 加载合约 - 使用已知的合约信息
      setStatus('📄 Loading smart contract...');
      const contractData = {
        networks: {
          5777: {
            address: '0x7F2340066f633d999b7da8EF78C0df75C852B478'
          }
        },
        abi: [
          {
            "inputs": [{"name": "_name", "type": "string"}, {"name": "_description", "type": "string"}, {"name": "_price", "type": "uint256"}],
            "name": "createProduct",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [{"name": "_name", "type": "string"}, {"name": "_location", "type": "string"}, {"name": "_contact", "type": "string"}],
            "name": "registerSupplier",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [{"name": "_productId", "type": "uint256"}, {"name": "_to", "type": "address"}],
            "name": "transferProduct",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [{"name": "", "type": "uint256"}],
            "name": "products",
            "outputs": [{"name": "id", "type": "uint256"}, {"name": "name", "type": "string"}, {"name": "description", "type": "string"}, {"name": "price", "type": "uint256"}, {"name": "owner", "type": "address"}, {"name": "created", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [{"name": "", "type": "address"}],
            "name": "suppliers",
            "outputs": [{"name": "name", "type": "string"}, {"name": "location", "type": "string"}, {"name": "contact", "type": "string"}, {"name": "isRegistered", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "productCount",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ]
      };

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = contractData.networks[networkId];
      
      if (!deployedNetwork) {
        throw new Error(`Contract not deployed on network ${networkId}`);
      }

      const contractInstance = new web3Instance.eth.Contract(
        contractData.abi,
        deployedNetwork.address
      );

      setWeb3(web3Instance);
      setContract(contractInstance);
      setAccount(accounts[0]);
      setStatus('✅ Ready for blockchain operations');
      setLoading(false);

      // 加载初始数据
      await loadData(contractInstance);

    } catch (error) {
      console.error('Initialization error:', error);
      setStatus(`❌ Connection failed: ${error.message}`);
      setLoading(false);
    }
  };

  const loadData = async (contractInstance) => {
    try {
      setStatus('📊 Loading blockchain data...');
      // 加载产品数量
      const productCount = await contractInstance.methods.productCount().call();
      console.log('Product count:', productCount);
      
      // 加载产品列表
      const productList = [];
      for (let i = 1; i <= productCount; i++) {
        try {
          const product = await contractInstance.methods.products(i).call();
          productList.push({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            owner: product.owner,
            created: new Date(product.created * 1000).toLocaleString()
          });
        } catch (err) {
          console.log(`Error loading product ${i}:`, err);
        }
      }
      setProducts(productList);
      setStatus('✅ Ready for blockchain operations');

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      alert('⚠️ Please fill in all product fields');
      return;
    }

    try {
      setStatus('🔄 Creating product on blockchain...');
      const priceInWei = web3.utils.toWei(newProduct.price, 'ether');
      
      await contract.methods
        .createProduct(newProduct.name, newProduct.description, priceInWei)
        .send({ from: account });

      setStatus('✅ Product created successfully!');
      setNewProduct({ name: '', description: '', price: '' });
      
      // 延迟重新加载数据以确保区块链更新
      setTimeout(() => loadData(contract), 2000);

    } catch (error) {
      console.error('Error creating product:', error);
      setStatus(`❌ Failed to create product: ${error.message}`);
    }
  };

  const registerSupplier = async () => {
    if (!newSupplier.name || !newSupplier.location || !newSupplier.contact) {
      alert('⚠️ Please fill in all supplier fields');
      return;
    }

    try {
      setStatus('🔄 Registering supplier on blockchain...');
      
      await contract.methods
        .registerSupplier(newSupplier.name, newSupplier.location, newSupplier.contact)
        .send({ from: account });

      setStatus('✅ Supplier registered successfully!');
      setNewSupplier({ name: '', location: '', contact: '' });

    } catch (error) {
      console.error('Error registering supplier:', error);
      setStatus(`❌ Failed to register supplier: ${error.message}`);
    }
  };

  const transferProduct = async () => {
    if (!selectedProduct || !transferAddress) {
      alert('⚠️ Please select a product and enter transfer address');
      return;
    }

    if (!web3.utils.isAddress(transferAddress)) {
      alert('❌ Invalid Ethereum address format');
      return;
    }

    try {
      setStatus('🔄 Transferring product ownership...');
      
      await contract.methods
        .transferProduct(selectedProduct, transferAddress)
        .send({ from: account });

      setStatus('✅ Product transferred successfully!');
      setSelectedProduct('');
      setTransferAddress('');
      
      // 延迟重新加载数据
      setTimeout(() => loadData(contract), 2000);

    } catch (error) {
      console.error('Error transferring product:', error);
      setStatus(`❌ Transfer failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '20px',
          animation: 'spin 2s linear infinite'
        }}>⚡</div>
        <div style={{ fontSize: '18px', fontWeight: '500' }}>{status}</div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* 顶部导航栏 */}
      <nav style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🔗 Blockchain Supply Chain Management
          </h1>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '15px',
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '8px 16px', 
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              👤 Account: {account.substring(0, 6)}...{account.substring(38)}
            </div>
            <div style={{ 
              background: status.includes('✅') ? 'rgba(40, 167, 69, 0.8)' : 
                         status.includes('❌') ? 'rgba(220, 53, 69, 0.8)' : 
                         'rgba(255, 193, 7, 0.8)',
              padding: '8px 16px', 
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              {status}
            </div>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* 操作面板 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '30px', 
          marginBottom: '40px' 
        }}>
          
          {/* 创建产品卡片 */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
          }}>
            <h2 style={{ 
              margin: '0 0 25px 0', 
              color: '#2d3748',
              fontSize: '24px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              📦 Create New Product
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter product name"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter product description"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="0.00"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <button
              onClick={createProduct}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.4)';
              }}
            >
              ✅ Create Product
            </button>
          </div>

          {/* 注册供应商卡片 */}
          <div style={{ 
            background: 'white', 
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
          }}>
            <h2 style={{ 
              margin: '0 0 25px 0', 
              color: '#2d3748',
              fontSize: '24px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              🏭 Register Supplier
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Supplier Name</label>
              <input
                type="text"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter supplier name"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Location</label>
              <textarea
                value={newSupplier.location}
                onChange={(e) => setNewSupplier({...newSupplier, location: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  minHeight: '80px',
                  resize: 'vertical',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter location"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Contact Information</label>
              <input
                type="text"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                style={{ 
                  width: '90%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter contact info"
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <button
              onClick={registerSupplier}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(66, 153, 225, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(66, 153, 225, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(66, 153, 225, 0.4)';
              }}
            >
              🏭 Register Supplier
            </button>
          </div>
        </div>
        <div style={{ 
          background: 'white', 
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            margin: '0 0 25px 0', 
            color: '#2d3748',
            fontSize: '24px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🔄 Transfer Product Ownership
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px', 
            alignItems: 'end' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Select Your Product</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a product to transfer</option>
                {products.filter(p => p.owner.toLowerCase() === account.toLowerCase()).map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (ID: {product.id}) - {web3 ? web3.utils.fromWei(product.price, 'ether') : product.price} ETH
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#4a5568',
                fontSize: '14px'
              }}>Recipient Address</label>
              <input
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'monospace'
                }}
                placeholder="0x..."
              />
            </div>
            
            <button
              onClick={transferProduct}
              disabled={!selectedProduct || !transferAddress}
              style={{
                padding: '14px 24px',
                background: selectedProduct && transferAddress ? 
                  'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' : '#cbd5e0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: selectedProduct && transferAddress ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                boxShadow: selectedProduct && transferAddress ? 
                  '0 4px 15px rgba(237, 137, 54, 0.4)' : 'none'
              }}
            >
              🔄 Transfer Ownership
            </button>
          </div>
        </div>

        {/* 产品列表 */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            margin: '0 0 25px 0', 
            color: '#2d3748',
            fontSize: '24px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Product Registry ({products.length} products)
          </h2>
          
          {products.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#718096',
              fontSize: '18px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
              <p style={{ margin: 0, fontWeight: '500' }}>No products registered yet</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '16px' }}>Create your first product using the form above!</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: '0',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
              }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>ID</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Product Name</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Description</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Price (ETH)</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Owner</th>
                    <th style={{ 
                      padding: '16px 20px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id} style={{ 
                      backgroundColor: product.owner.toLowerCase() === account.toLowerCase() ? 
                        'rgba(72, 187, 120, 0.1)' : 
                        index % 2 === 0 ? '#f8f9fa' : 'white',
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (product.owner.toLowerCase() === account.toLowerCase()) {
                        e.currentTarget.style.backgroundColor = 'rgba(72, 187, 120, 0.2)';
                      } else {
                        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (product.owner.toLowerCase() === account.toLowerCase()) {
                        e.currentTarget.style.backgroundColor = 'rgba(72, 187, 120, 0.1)';
                      } else {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                      }
                    }}>
                      <td style={{ 
                        padding: '16px 20px',
                        fontWeight: '600',
                        color: '#4a5568'
                      }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          #{product.id}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📦 {product.name}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 20px',
                        color: '#4a5568',
                        maxWidth: '200px'
                      }}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {product.description}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 20px',
                        fontWeight: '600',
                        color: '#38a169'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          💰 {web3 ? parseFloat(web3.utils.fromWei(product.price, 'ether')).toFixed(4) : product.price}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 20px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#4a5568'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{product.owner.substring(0, 6)}...{product.owner.substring(38)}</span>
                          {product.owner.toLowerCase() === account.toLowerCase() && 
                            <span style={{ 
                              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              YOU
                            </span>
                          }
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px 20px',
                        fontSize: '13px',
                        color: '#718096'
                      }}>
                        🕒 {product.created}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 快速操作提示 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '16px',
          padding: '25px',
          marginTop: '30px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <h3 style={{ 
            margin: '0 0 15px 0', 
            color: '#4a5568',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            💡 Quick Test Guide
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '15px',
            fontSize: '14px',
            color: '#718096'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>1️⃣</span>
              <span>Create test products with different prices</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>2️⃣</span>
              <span>Transfer products to other Ganache accounts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>3️⃣</span>
              <span>Use the Connection Test to view technical details</span>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        marginTop: '50px',
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>
            🔗 Blockchain Supply Chain Management System
          </p>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
            Connected to Ganache Local Network (ID: 5777) | Built with React & Web3.js
          </p>
        </div>
      </footer>
    </div>
  );
}

export default SupplyChainApp;
