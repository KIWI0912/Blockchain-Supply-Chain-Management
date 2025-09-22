import React, { useState } from 'react';
import Web3 from 'web3';
import SupplyChainContract from './SupplyChain.json';

const UploadDocument = () => {
    const [hash, setHash] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [account, setAccount] = useState('');

    const uploadDocument = async () => {
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

            await contract.methods.uploadDocument(hash, documentType).send({ from: accounts[0] });
            alert('Document uploaded successfully!');
        } catch (error) {
            console.error('Error uploading document:', error.message);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Upload Document</h1>
            <input
                type="text"
                placeholder="Document Hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
            />
            <input
                type="text"
                placeholder="Document Type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
            />
            <button onClick={uploadDocument}>Upload Document</button>
        </div>
    );
};

export default UploadDocument;
