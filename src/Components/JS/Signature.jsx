import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import baseUrl from "../../BootApi";
import { toast } from "react-toastify";
import { Button, Dropdown, Space, Form, Input, Upload, Modal,message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";

const items = [
  { key: "ELECTRONIC", label: "ELECTRONIC" },
  { key: "DRAWN", label: "DRAWN" },
  { key: "INITIAL", label: "INITIAL" },
];

const decodeBase64Url = (encodedWord) => {
  try {
    return atob(encodedWord);
  } catch (e) {
    console.error("Failed to decode URL:", e);
    return null;
  }
};

const Signature = () => {
  const [sign, setSign] = useState(null);
  const [dataURL, setDataURL] = useState(null);
  const [signatureType, setSignatureType] = useState();
  const [fileList, setFileList] = useState([]);
  const { documentId, placeholder, email } = useParams();
  const decodedEmail = decodeBase64Url(email);
  const decodedDocumentId = decodeBase64Url(documentId);
  const decodedPlaceholder = decodeBase64Url(placeholder);
  const [name, setName] = useState("");
  const [document, setDocument] = useState({});
  const signatureRef = useRef();
  const [isSignatureAdded, setIsSignatureAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setSignatureType(null);
    setFileList([]);
    setName("");
    if (sign) {
      sign.clear();
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleClear = () => {
    sign.clear();
  };

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSave = () => {
    if (sign) {
      const trimmedDataUrl = sign.getTrimmedCanvas().toDataURL("image/png");
      setDataURL(trimmedDataUrl);
      return trimmedDataUrl;
    }
  };

  const getApiEndpoint = () => {
    switch (signatureType) {
      case "ELECTRONIC":
        return "/signature/addSignatureElectronic";
      case "INITIAL":
      case "DRAWN":
        return "/signature/updateSign";
      default:
        return "";
    }
  };

  const base64ToByteArray = (base64String) => {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return byteArray;
  };

  const submit = async () => {
    setIsModalOpen(false);
    const savedDataURL = handleSave();
    let signatureUrl = "";
    const apiEndpoint = getApiEndpoint();
    if (!apiEndpoint) {
      message.error("Invalid signature type.");
      return;
    }

    let signatureData;
    let headers = {};

    try {
      if (signatureType === "INITIAL") {
        if (fileList.length === 0) {
          toast.error("Please upload a signature file.");
          return;
        }
        signatureData = new FormData();
        signatureData.append("signatureType", signatureType);
        signatureData.append("signatureData", fileList[0].originFileObj);
        signatureData.append("documentId", decodedDocumentId);
        signatureData.append("placeholder", decodedPlaceholder);
        signatureData.append("signed", true);
        signatureData.append("recipientEmail", decodedEmail);
        signatureUrl = URL.createObjectURL(fileList[0].originFileObj);
      } else if (signatureType === "ELECTRONIC") {
        signatureData = {
          signatureType,
          documentId: decodedDocumentId,
          placeholder: decodedPlaceholder,
          signed: "true",
        };
        headers = { "Content-Type": "application/json" };

        const response = await axios.put(
          `${baseUrl}${apiEndpoint}/${decodedEmail}/${decodedDocumentId}/${name}`,
          signatureData,
          { headers }
        );
        const { signatureData: signatureBase64 } = response.data;
        signatureUrl = `data:image/png;base64,${signatureBase64}`;
      } else if (signatureType === "DRAWN") {
        const byteArray = base64ToByteArray(savedDataURL.split(",")[1]);
        const blob = new Blob([byteArray], { type: "image/png" });
        signatureData = new FormData();
        signatureData.append("signatureType", signatureType);
        signatureData.append("signatureData", blob);
        signatureData.append("documentId", decodedDocumentId);
        signatureData.append("placeholder", decodedPlaceholder);
        signatureData.append("signed", true);
        signatureUrl = savedDataURL;
      }

      if (signatureType !== "ELECTRONIC") {
        await axios.put(
          `${baseUrl}${apiEndpoint}/${decodedEmail}/${decodedDocumentId}`,
          signatureData
        );
      }

      let updatedDocumentBody = document.documentBody;
      if (updatedDocumentBody.includes(decodedPlaceholder)) {
        updatedDocumentBody = updatedDocumentBody.replace(
          decodedPlaceholder,
          `<img src="${signatureUrl}" alt="Signature" width="200" height="100"/>`
        );
      } else {
        updatedDocumentBody = updatedDocumentBody.replace(
          /<img src="data:image\/png;base64,.*" alt="Signature" \/>/,
          `<img src="${signatureUrl}" alt="Signature" />`
        );
      }
      setDocument((prevDocument) => ({
        ...prevDocument,
        documentBody: updatedDocumentBody,
      }));
      setIsSignatureAdded(true);
      message.success("Signature Added");
    } catch (error) {
      message.error("Something went wrong");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const documentResponse = await axios.get(
          `${baseUrl}/document/getDocument/${decodedDocumentId}`
        );
        const documentData = documentResponse.data;
        setDocument(documentData);

        const signatureResponse = await axios.get(
          `${baseUrl}/signature/getSignatures/${decodedDocumentId}`
        );
        const signaturesData = signatureResponse.data;

        let updatedDocumentBody = documentData.documentBody;

        signaturesData.forEach((signature) => {
          const { signatureData: signatureBase64, placeholder } = signature;
          const signatureUrl = `data:image/png;base64,${signatureBase64}`;
          updatedDocumentBody = updatedDocumentBody.replace(
            placeholder,
            `<img src="${signatureUrl}" alt="Signature" width="200" height="100"/>`
          );
        });

        setDocument((prevDocument) => ({
          ...prevDocument,
          documentBody: updatedDocumentBody,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    const checkSignatureStatus = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/signature/status/${decodedDocumentId}/${decodedPlaceholder}`
        );
        setIsSignatureAdded(response.data);
      } catch (error) {
        console.error("Error fetching signature status:", error);
      }
    };

    fetchData();
    checkSignatureStatus();
  }, [decodedDocumentId, decodedPlaceholder]);

  const handleMenuClick = (e) => {
    setSignatureType(e.key);
  };

  return (
    <div className="box">
      <Modal
        title="Signature"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" onClick={submit}>
            Submit
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        <Form onFinish={submit} style={{ width: "450px", height: "auto" }}>
          <Space direction="vertical">
            <Dropdown
              menu={{
                items: items.map((item) => ({
                  ...item,
                  onClick: handleMenuClick,
                })),
              }}
              placement="bottomLeft"
              arrow={{ pointAtCenter: true }}
            >
              <Button>Signature type</Button>
            </Dropdown>
          </Space>
          {signatureType === "INITIAL" && (
            <Upload
              name="file"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleUploadChange}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          )}
          {signatureType === "DRAWN" && (
            <div>
              <div style={{ border: "2px solid black" }}>
                <SignatureCanvas
                  ref={(ref) => setSign(ref)}
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: "sigCanvas",
                  }}
                />
              </div>
              <Button onClick={handleClear}>Clear</Button>
            </div>
          )}
          {signatureType === "ELECTRONIC" && (
            <Form.Item>
              <Input
                size="large"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "270px" }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <div className="d-flex justify-content-center" style={{ margin: "20px" }}>
        <Button type="primary" onClick={showModal} disabled={isSignatureAdded} style={{backgroundColor:"#01606F",color:"white"}}>
          Click Here To Sign
        </Button>
      </div>
      <div className="d-flex justify-content-center">
        <div
          ref={signatureRef}
          dangerouslySetInnerHTML={{ __html: document.documentBody }}
          style={{
            color: "black",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            padding: "20px",
            width: "794px",
            height: "1123px",
            background: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            overflow: "hidden",
            transform: "scale(1)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Signature;
