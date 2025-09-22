import React from 'react';
import UploadDocument from './components/UploadDocument';
import VerifyDocument from './components/VerifyDocument';
import TriggerPayment from './components/TriggerPayment';

const App = () => {
    return (
        <div>
            <h1>Blockchain Supply Chain System</h1>
            <UploadDocument />
            <VerifyDocument />
            <TriggerPayment />
        </div>
    );
};

export default App;