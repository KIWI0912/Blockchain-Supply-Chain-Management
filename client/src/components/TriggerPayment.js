import React, { useState } from 'react';
import Web3 from 'web3';
import SupplyChainContract from './SupplyChain.json';

const TriggerPayment = () => {
    const [supplierAddress, setSupplierAddress] = useState('');
    const [account, setAccount] = useState('');

    const triggerPayment = async () => {
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

            await contract.methods.triggerPayment(supplierAddress).send({ from: accounts[0] });
            alert('Payment triggered successfully!');
        } catch (error) {
            console.error('Error triggering payment:', error.message);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>Trigger Payment</h1>
            <input
                type="text"
                placeholder="Supplier Address"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
            />
            <button onClick={triggerPayment}>Trigger Payment</button>
        </div>
    );
};

export default TriggerPayment;