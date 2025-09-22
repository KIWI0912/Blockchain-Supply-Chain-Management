import React, { useState } from 'react';
import Web3 from 'web3';
import SupplyChainContract from './SupplyChain.json';

const VerifyDocument = () => {
    const [supplierAddress, setSupplierAddress] = useState('');
    const [documentIndex, setDocumentIndex] = useState('');
    const [account, setAccount] = useState('');

    const verifyDocument = async () => {
        try {
            const web3 = new Web3(Web3.givenProvider);
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = SupplyChainContract.networks[networkId];

            if (!deployedNetwork) {
                throw new Error('Contract not deployed on the current network.');
            }

            const contract = new web3.eth.Contract(SupplyChainContract.abi, deployedNetwork.address);
            const accounts = await web3.eth.requestAccounts();

            setAccount(accounts[0]);

            await contract.methods.verifyDocument(supplierAddress, documentIndex).send({ from: accounts[0] });
            alert('Document verified successfully!');
        } catch (error) {
            console.error('Error verifying document:', error.message);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Verify Document</h1>
            <input
                type="text"
                placeholder="Supplier Address"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
            />
            <input
                type="number"
                placeholder="Document Index"
                value={documentIndex}
                onChange={(e) => setDocumentIndex(e.target.value)}
            />
            <button onClick={verifyDocument}>Verify Document</button>
        </div>
    );
};

export default VerifyDocument;