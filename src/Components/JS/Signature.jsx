


import React, { useState } from "react";
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import baseUrl from "../../BootApi";
import { toast } from "react-toastify";
import { Button, Dropdown, Space, Form, Input, Upload, message, } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import FormItem from "antd/es/form/FormItem";

const items = [
    {
        key: 'ELECTRONIC',
        label: (
            <span>ELECTRONIC</span>
        ),
    },
    {
        key: 'DRAWN',
        label: (
            <span>DRAWN</span>
        ),
    },
    {
        key: 'INITIAL',
        label: (
            <span>INITIAL</span>
        ),
    },
];

const props = {
    name: 'file',
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
        authorization: 'authorization-text',
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};
const Signature = () => {
    const [sign, setSign] = useState(null);
    const [dataURL, setDataURL] = useState(null);
    const [signatureType, setSignatureType] = useState();
    const [recipientEmail, setRecipientEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [documentId, setDocumentId] = useState("");
    const [fileList, setFileList] = useState([]);


    const handleClear = () => {
        sign.clear();
    }

    const handleUploadChange = ({ file, fileList }) => {
        setFileList(fileList);
    }
    const handleSave = () => {
        if (sign) {
            const trimmedDataUrl = sign.getTrimmedCanvas().toDataURL("image/png");
            setDataURL(trimmedDataUrl);
            return trimmedDataUrl
        }
    }
    const getApiEndpoint = () => {
        switch (signatureType) {
            case 'ELECTRONIC':
                return '/signature/addSignatureElectronic';
            case 'INITIAL':
                return '/signature/addSignature';
            case 'DRAWN':
                return '/signature/addSignatureDrawn';
            default:
                return '';
        }
    }
    const base64ToByteArray = (base64String) => {
        const binaryString = window.atob(base64String);
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    };

    const submit = async () => {
        const savedDataURL = handleSave();
        // const base64Data = savedDataURL.split(',')[1];
        // const base64Data = savedDataURL.replace(/^data:image\/png;base64,/, "");

        // if (!base64Data) {
        //     toast.error("Please provide a signature.");
        //     return;
        // }
        console.log(typeof savedDataURL);
        console.log(signatureType);
        console.log(recipientEmail);
        console.log(userId);
        console.log(documentId);

        const apiEndpoint = getApiEndpoint();
        if (!apiEndpoint) {
            toast.error("Invalid signature type.");
            return;
        }
        let signatureData;
        let headers;

        if (signatureType === 'INITIAL') {
            if (fileList.length === 0) {
                toast.error("Please upload a signature file.");
                return;
            }
            signatureData = new FormData();
            signatureData.append('signatureType', signatureType);
            signatureData.append('signatureData', fileList[0].originFileObj);
            signatureData.append('recipientEmail', recipientEmail);
            signatureData.append('userId', userId);
            signatureData.append('documentId', documentId);

        }
        else if (signatureType === "ELECTRONIC") {
            signatureData = {
                signatureType: signatureType,
                recipientEmail: recipientEmail,
                userId: userId,
                documentId: documentId
            };
            headers = { 'Content-Type': 'application/json' };
        }
        else if (signatureType === "DRAWN") {
            const byteArray = base64ToByteArray(savedDataURL.split(',')[1]);
            const blob = new Blob([byteArray], { type: 'image/png' });
            signatureData = new FormData();
            signatureData.append('signatureType', signatureType);
            signatureData.append('signatureData',blob);
            signatureData.append('recipientEmail', recipientEmail);
            signatureData.append('userId', userId);
            signatureData.append('documentId', documentId);
        }

        await axios.post(`${baseUrl}${apiEndpoint}`, signatureData, {
        }).then(
            (response) => {
                toast.success("Signature Added");
            },
            (error) => {
                toast.error("Something went wrong");
                console.log(error);
            }
        )
    }



    const handleMenuClick = (e) => {
        setSignatureType(e.key);
    }
    return (
        <div className="box">
            <Form onFinish={submit} style={{width:"600px",height:"auto"}} className="form">
                <Space direction="vertical">
                    <Dropdown
                        // menu={{
                        //     items,
                        // }}
                        menu={{
                            items: items.map(item => ({
                                ...item,
                                onClick: handleMenuClick,
                            }))
                        }}
                        placement="bottomLeft"
                        arrow={{
                            pointAtCenter: true,
                        }}
                    >
                        <Button>Signature type</Button>
                    </Dropdown>

                </Space>
                <Form.Item
                    name="Recipent Email"
                    label="Recipient Email"
                    style={
                        {
                            width: "45%",
                            marginLeft: "35px"
                        }}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                </Form.Item>
                <Form.Item
                    name="userId"
                    label="userId"
                    style={
                        {
                            width: "45%",
                            marginLeft: "35px"
                        }}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
                </Form.Item>
                <Form.Item
                    name="documentId"
                    label="documentId"
                    style={
                        {
                            width: "45%",
                            marginLeft: "35px"
                        }}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input value={documentId} onChange={(e) => setDocumentId(e.target.value)} />
                </Form.Item>

                {signatureType === 'INITIAL' && (
                    <Upload
                        name="file"
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={handleUploadChange}
                    >
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                )}
                {signatureType === 'DRAWN' && (
                    <div>
                        <SignatureCanvas ref={(ref) => setSign(ref)} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
                        <div>
                            < button onClick={handleClear}>Clear</button>
                            <button onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}
                <Form.Item>
                    <button htmlType="submit" className="btn btn-success">Add Signature</button>
                </Form.Item>
            </Form>
        </div >
    );
}

export default Signature;
