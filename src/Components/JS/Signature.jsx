
import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import baseUrl from "../../BootApi";
import { toast } from "react-toastify";
import { Button, Dropdown, Space, Form, Input, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import "../CSS/signature.css"
import { useParams } from "react-router-dom";

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

const Signature = () => {
    const [sign, setSign] = useState(null);
    const [dataURL, setDataURL] = useState(null);
    const [signatureType, setSignatureType] = useState();
    const [fileList, setFileList] = useState([]);
    const { documentId, placeholder } = useParams();
    const [name, setName] = useState("");
    const [document, setDocument] = useState({});
    const signatureRef = useRef();

    const handleClear = () => {
        sign.clear();
    }

    useEffect(() => {
        getDocument(documentId);
    }, [documentId]);

    const handleUploadChange = ({ file, fileList }) => {
        setFileList(fileList);
    }

    const handleSave = () => {
        if (sign) {
            const trimmedDataUrl = sign.getTrimmedCanvas().toDataURL("image/png");
            setDataURL(trimmedDataUrl);
            return trimmedDataUrl;
        }
    }

    const getDocument = (id) => {
        axios.get(`${baseUrl}/document/get-document/${id}`).then(
            (response) => {
                setDocument(response.data);
                toast.success("Document Success");
            }
        ).catch((error) => {
            toast.error("Something Went Wrong");
        })
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
        let signatureUrl = '';

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
            signatureData.append('documentId', documentId);
            signatureUrl = URL.createObjectURL(fileList[0].originFileObj);
        } else if (signatureType === "ELECTRONIC") {
            signatureData = {
                signatureType: signatureType,
                documentId: documentId
            };
            headers = { 'Content-Type': 'application/json' };

            try {
                const response = await axios.post(`${baseUrl}${apiEndpoint}?name=${name}`, signatureData, { headers });
                const { signatureData: signatureBase64 } = response.data;
                signatureUrl = `data:image/png;base64,${signatureBase64}`;
                toast.success("Signature Added");
            } catch (error) {
                toast.error("Something went wrong");
                console.log(error);
            }
        } else if (signatureType === "DRAWN") {
            const byteArray = base64ToByteArray(savedDataURL.split(',')[1]);
            const blob = new Blob([byteArray], { type: 'image/png' });
            signatureData = new FormData();
            signatureData.append('signatureType', signatureType);
            signatureData.append('signatureData', blob);
            signatureData.append('documentId', documentId);
            signatureUrl = savedDataURL;
        }

        if (signatureType !== 'ELECTRONIC') {
            try {
                await axios.post(`${baseUrl}${apiEndpoint}`, signatureData);
                toast.success("Signature Added");
            } catch (error) {
                toast.error("Something went wrong");
                console.log(error);
            }
        }

        let updatedDocumentBody = document.documentBody;
        if (updatedDocumentBody.includes(placeholder)) {
            updatedDocumentBody = updatedDocumentBody.replace(
                placeholder,
                `<img src="${signatureUrl}" alt="Signature" width="200" height="100"/>`
            );
        } else {
            updatedDocumentBody = updatedDocumentBody.replace(
                /<img src="data:image\/png;base64,.*" alt="Signature" \/>/,
                `<img src="${signatureUrl}" alt="Signature" />`
            );
        }
        setDocument({ ...document, documentBody: updatedDocumentBody });
    }

    const handleMenuClick = (e) => {
        setSignatureType(e.key);
    }

    return (
        <div className="box">
            <Form onFinish={submit} style={{ width: "600px", height: "auto" }} className="form">
                <Space direction="vertical">
                    <Dropdown
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

                <h1></h1>
                <h1></h1>

                {signatureType === 'DRAWN' && (
                    <div>
                        <SignatureCanvas ref={(ref) => setSign(ref)} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
                        <div>
                            <button onClick={handleClear}>Clear</button>
                            <button onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

                {signatureType === 'ELECTRONIC' && (
                    <div>
                        <Form.Item>
                            <Input
                                size="large"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '270px' }} />
                        </Form.Item>
                    </div>
                )}

                <Form.Item>
                    <button type="submit" className="btn btn-success">Add Signature</button>
                </Form.Item>
            </Form>

            <div
                ref={signatureRef}
                dangerouslySetInnerHTML={{ __html: document.documentBody }}
                style={{
                    border: "2px solid black",
                    color: "black",
                    height: "auto",
                    whiteSpace: "pre",
                    overflowWrap: "break-word",
                    padding: "20px",
                    margin: "20px",
                }}
            ></div>
        </div>
    );
}

export default Signature;

