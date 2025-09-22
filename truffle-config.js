require('dotenv').config();
const { MNEMONIC, PROJECT_ID } = process.env;
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const path = require('path');

module.exports = {
networks: {
  development: {
    host: "127.0.0.1",
    port: 7545,
    network_id: "5777",
    gas: 6721975,
    gasPrice: 20000000000,
  },
  goerli: {
    provider: () => new HDWalletProvider(MNEMONIC, `https://goerli.infura.io/v3/${PROJECT_ID}`),
    network_id: 5,
    confirmations: 2,
    timeoutBlocks: 200,
    skipDryRun: true,
  },
  private: {
    provider: () => new HDWalletProvider(MNEMONIC, `https://your-private-network.io`),
    network_id: 2111,
    production: true,
  },
},

migrations_directory: "./migrations",

mocha: {
  timeout: 100000,
},

compilers: {
  solc: {
    version: "0.8.21",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "istanbul",
    },
  },
},

plugins: ["truffle-plugin-verify"],

// Truffle v5.x 的正确钩子语法
hooks: {
  after_migrate: async function(config, network, accounts) {
    console.log('\n🚀 Post-migration hook triggered!');
    console.log(`📡 Network: ${network}`);
    
    // 添加延迟确保文件写入完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const projectRoot = process.cwd();
      const sourceFile = path.join(projectRoot, 'build', 'contracts', 'SupplyChain.json');
      const targetDir = path.join(projectRoot, 'client', 'my-react-app', 'src', 'components');
      const targetFile = path.join(targetDir, 'SupplyChain.json');
      
      console.log(`📂 Project root: ${projectRoot}`);
      console.log(`📄 Source: ${sourceFile}`);
      console.log(`📁 Target: ${targetFile}`);

      // 检查源文件
      if (!fs.existsSync(sourceFile)) {
        console.error(`❌ Source file not found: ${sourceFile}`);
        return;
      }
      console.log('✅ Source file exists');

      // 创建目标目录
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`📁 Created directory: ${targetDir}`);
      }

      // 复制文件
      fs.copyFileSync(sourceFile, targetFile);
      console.log('📋 File copied successfully');

      // 验证并显示合约信息
      if (fs.existsSync(targetFile)) {
        const contractData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
        const networks = Object.keys(contractData.networks || {});
        
        console.log('✅ File validation successful');
        console.log(`🌐 Deployed networks: ${networks.join(', ')}`);
        
        // 显示合约地址
        networks.forEach(networkId => {
          const networkData = contractData.networks[networkId];
          if (networkData && networkData.address) {
            console.log(`📍 Network ${networkId}: ${networkData.address}`);
          }
        });
        
        console.log('🎉 Contract file successfully copied to React components!');
      } else {
        console.error('❌ File copy verification failed');
      }
      
    } catch (error) {
      console.error('❌ Hook execution error:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}
};