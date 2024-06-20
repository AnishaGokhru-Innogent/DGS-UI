import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import baseUrl from "../../BootApi";
import { useReactToPrint } from "react-to-print";
import { Button, notification, Row, Col, Typography } from "antd";
import { HomeOutlined, DownloadOutlined } from "@ant-design/icons";
import "../CSS/viewDocument.css";

const { Title } = Typography;

export function Seedocument() {
  const bearerToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [document, setDocument] = useState({});
  const [signatures, setSignatures] = useState([]);
  const signatureRef = useRef();
  const navigate = useNavigate();

  const { id } = useParams();

  async function getDocumentAndSignature(id) {
    try {
      const documentResponse = await axios.get(
        `${baseUrl}/document/getDocument/${id}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      const documentData = documentResponse.data;
      setDocument(documentData);

      const signatureResponse = await axios.get(
        `${baseUrl}/signature/getSignatures/${id}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
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

  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, message) => {
    api[type]({
      message: message,
    });
  };

  const generatePdf = useReactToPrint({
    content: () => signatureRef.current,
    documentTitle: document.documentName,
    onAfterPrint: () =>
      openNotificationWithIcon("success", `Document Downloaded`),
  });

  useEffect(() => {
    getDocumentAndSignature(id);
  }, [id]);

  return (
    <div className="container mt-4">
      {contextHolder}
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate("/home")}
            style={{backgroundColor:"#01606F"}}
          >
            Home
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={generatePdf}
            style={{backgroundColor:"#01606F"}}
          >
            Download as PDF
          </Button>
        </Col>
      </Row>
      <Row justify="center" className="mt-4">
        <Col span={24} className="text-center">
          <Title level={2}>{document.documentName}</Title>
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <div>
            <div
              ref={signatureRef}
              dangerouslySetInnerHTML={{ __html: document.documentBody }}
              style={{
                color: "black",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                padding: "20px",
                // border: "2px solid black",
                width: "794px",
                height: "1123px",
                background: "white",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
                // margin: "0 auto",
                overflow: "hidden",
                transform: "scale(1)",
              }}
            ></div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
