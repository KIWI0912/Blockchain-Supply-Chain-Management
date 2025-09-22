// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    struct Document {
        string hash; // 文件哈希值
        string documentType; // 文件类型（发货单、质检报告等）
        bool verified; // 是否验证通过
    }

    struct Supplier {
        address supplierAddress;
        Document[] documents;
    }

    mapping(address => Supplier) public suppliers;
    mapping(address => bool) public payments; // 记录支付状态

    event DocumentUploaded(address indexed supplier, string hash, string documentType);
    event PaymentTriggered(address indexed supplier);

    // 上传文件哈希值
    function uploadDocument(string memory _hash, string memory _documentType) public {
        suppliers[msg.sender].supplierAddress = msg.sender;
        suppliers[msg.sender].documents.push(Document(_hash, _documentType, false));
        emit DocumentUploaded(msg.sender, _hash, _documentType);
    }

    // 验证文件
    function verifyDocument(address _supplier, uint _index) public {
        require(_index < suppliers[_supplier].documents.length, "Invalid document index");
        suppliers[_supplier].documents[_index].verified = true;
    }

    // 触发支付
    function triggerPayment(address _supplier) public {
        require(suppliers[_supplier].supplierAddress != address(0), "Supplier not found");
        for (uint i = 0; i < suppliers[_supplier].documents.length; i++) {
            require(suppliers[_supplier].documents[i].verified, "All documents must be verified");
        }
        payments[_supplier] = true;
        emit PaymentTriggered(_supplier);
    }
}
