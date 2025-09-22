# Blockchain Supply Chain Management

基于区块链的供应链管理系统，使用 Solidity 编写智能合约，并结合 Truffle 框架和 React 前端进行演示。

## 项目结构

- `contracts/` — 智能合约源码（如 SupplyChain.sol）
- `migrations/` — Truffle 部署脚本
- `scripts/` — 辅助脚本（如合约校验、部署检查等）
- `client/` — 前端代码（React 示例组件等）
- `build/contracts/SupplyChain.json` — 合约 ABI 文件
- `truffle-config.js` — Truffle 配置文件
- `package.json` — Node.js 依赖声明
- `.gitignore` — Git 忽略文件

## 核心功能

- 供应商上传文件（哈希 + 类型）
- 文件验证
- 所有文件验证后触发支付
- 事件通知（文件上传、支付触发）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 编译合约

```bash
truffle compile
```

### 3. 部署合约

```bash
truffle migrate
```

### 4. 启动前端

进入 `client` 目录，按说明启动 React 应用。

## 安全说明

- **请勿上传 `.env` 文件**（包含私钥、助记词等敏感信息）
- `node_modules/` 由依赖自动安装，无需上传

## 参考

- Solidity 官方文档
- Truffle 官方文档
- React 官方文档

---

**English Version**

# Blockchain Supply Chain Management

A blockchain-based supply chain management demo using Solidity smart contracts, Truffle framework, and React frontend.

## Structure

- `contracts/` — Solidity smart contracts (e.g. SupplyChain.sol)
- `migrations/` — Truffle migration scripts
- `scripts/` — Utility scripts (contract verification, deployment checks, etc.)
- `client/` — Frontend code (React demo components)
- `build/contracts/SupplyChain.json` — Contract ABI file
- `truffle-config.js` — Truffle config
- `package.json` — Node.js dependencies
- `.gitignore` — Git ignore file

## Features

- Supplier document upload (hash + type)
- Document verification
- Trigger payment after all documents are verified
- Events (DocumentUploaded, PaymentTriggered)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Compile contracts

```bash
truffle compile
```

### 3. Deploy contracts

```bash
truffle migrate
```

### 4. Start frontend

Go to `client` directory and start React app as instructed.

## Security

- **Do NOT upload `.env`** (contains private keys, mnemonics, etc.)
- `node_modules/` is installed automatically, do not upload

## Reference

- Solidity Docs
- Truffle Docs
- React Docs
