import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import baseUrl from "../../BootApi";
import { toast } from "react-toastify";
import { Button, Dropdown, Space, Form, Input, Upload, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { log } from "util";

const items = [
  {
    key: "ELECTRONIC",
    label: <span>ELECTRONIC</span>,
  },
  {
    key: "DRAWN",
    label: <span>DRAWN</span>,
  },
  {
    key: "INITIAL",
    label: <span>INITIAL</span>,
  },
];

const decodeBase64Url = (encodedWord) => {
  try {
    return atob(encodedWord);
  } catch (e) {
    console.log("Failed to decode URL:", e);
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

  useEffect(() => {
    getDocumentAndSignature(decodedDocumentId);
    checkSignatureStatus(decodedDocumentId, decodedPlaceholder);
  }, [decodedDocumentId, decodedPlaceholder]);

  const handleUploadChange = ({ file, fileList }) => {
    setFileList(fileList);
  };

  const handleSave = () => {
    if (sign) {
      const trimmedDataUrl = sign.getTrimmedCanvas().toDataURL("image/png");
      setDataURL(trimmedDataUrl);
      return trimmedDataUrl;
    }
  };

  async function getDocumentAndSignature(id) {
    try {
      const documentResponse = await axios.get(
        `${baseUrl}/document/getDocument/${id}`
      );
      const documentData = documentResponse.data;
      setDocument(documentData);

      const signatureResponse = await axios.get(
        `${baseUrl}/signature/getSignatures/${id}`
      );
      const signaturesData = signatureResponse.data;
      console.log(signaturesData);

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
  }

  const getApiEndpoint = () => {
    switch (signatureType) {
      case "ELECTRONIC":
        return "/signature/addSignatureElectronic";
      case "INITIAL":
        return "/signature/updateSign";
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
    let signed = "";
    const apiEndpoint = getApiEndpoint();
    if (!apiEndpoint) {
      toast.error("Invalid signature type.");
      return;
    }
    let signatureData;
    let headers;
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
        signatureType: signatureType,
        documentId: decodedDocumentId,
        placeholder: decodedPlaceholder,
        signed: "true",
      };
      console.log(signatureData);
      headers = { "Content-Type": "application/json" };
      try {
        const response = await axios.put(
          `${baseUrl}${apiEndpoint}/${decodedEmail}/${decodedDocumentId}/${name}`,
          signatureData,
          { headers }
        );
        const { signatureData: signatureBase64 } = response.data;
        signatureUrl = `data:image/png;base64,${signatureBase64}`;
        console.log(signatureUrl);
        toast.success("Signature Added");
      } catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      }
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
      // signatureData = {
      //   signatureType: signatureType,
      //   signatureData: blob,
      //   documentId: decodedDocumentId,
      //   placeholder: decodedPlaceholder,
      //   signed: true,
      // };
    }
    if (signatureType !== "ELECTRONIC") {
      try {
        await axios.put(
          `${baseUrl}${apiEndpoint}/${decodedEmail}/${decodedDocumentId}`,
          signatureData
        );
        toast.success("Signature Added");
      } catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      }
    }
    let updatedDocumentBody = document.documentBody;
    console.log(decodedPlaceholder);
    if (updatedDocumentBody.includes(decodedPlaceholder)) {
      updatedDocumentBody = updatedDocumentBody.replace(
        decodedPlaceholder,
        `<img src="${signatureUrl}" alt="Signature" width="200" height="100"/>`
      );
    } else {
      updatedDocumentBody = updatedDocumentBody.replace(
        /<img src="data:image\/png;base64,.*" alt="Signature" \/>/,
        ` <img src="${signatureUrl}" alt="Signature" />`
      );
    }
    setDocument({ ...document, documentBody: updatedDocumentBody });
    setIsSignatureAdded(true);
  };

  const checkSignatureStatus = async (documentId, placeholder) => {
    try {
      const response = await axios.get(
        `${baseUrl}/signature/status/${documentId}/${placeholder}`
      );
      console.log(response.data);
      setIsSignatureAdded(response.data);
    } catch (error) {
      console.log("Error fetching signature status: " + error);
    }
  };

  const handleMenuClick = (e) => {
    setSignatureType(e.key);
  };
  return (
    <div className="box">
      <Modal
        title="Signature"
        open={isModalOpen}
        // onOk={submit}
        onCancel={handleCancel}
        footer={(_, {}) => (
          <>
            <Button onClick={submit}>Submit</Button>
            <Button onClick={handleCancel} primary>
              Cancel
            </Button>
          </>
        )}
      >
        <Form
          onFinish={submit}
          style={{ width: "450px", height: "auto" }}
          className="form"
        >
          <Space direction="vertical">
            <Dropdown
              menu={{
                items: items.map((item) => ({
                  ...item,
                  onClick: handleMenuClick,
                })),
              }}
              placement="bottomLeft"
              arrow={{
                pointAtCenter: true,
              }}
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
          <h1></h1>
          <h1></h1>
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
              <div>
                <button onClick={handleClear}>Clear</button>
              </div>
            </div>
          )}
          {signatureType === "ELECTRONIC" && (
            <div>
              <Form.Item>
                <Input
                  size="large"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "270px" }}
                />
              </Form.Item>
            </div>
          )}
        </Form>
      </Modal>

      <div className="d-flex justify-content-center">
        <div
          ref={signatureRef}
          dangerouslySetInnerHTML={{ __html: document.documentBody }}
          style={{
            color: "black",
            height: "auto",
            whiteSpace: "pre",
            overflowWrap: "break-word",
            padding: "20px",
            margin: "20px",
            backgroundColor: "lightgrey",
            width: "auto",
            minWidth: "800px",
          }}
        ></div>
      </div>
      <div className="d-flex">
        <Button
          type="primary"
          onClick={showModal}
          disabled={isSignatureAdded}
          style={{ marginLeft: "280px" }}
        >
          Click Here To Sign
        </Button>
      </div>
    </div>
  );
};
export default Signature;
