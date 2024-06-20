import axios from "axios";
import { useParams, useSearchParams } from "react-router-dom";
import baseUrl from "../../BootApi";
import { useEffect, useRef, useState } from "react";
import { Button, message } from "antd";
import { useReactToPrint } from "react-to-print";
import { HomeOutlined, DownloadOutlined } from "@ant-design/icons";

export function FinalDocument() {
  const documentId = useParams();
  const [document, setDocument] = useState();
  const signatureRef = useRef();

  useEffect(() => {
    getDocumentAndSignature(decodedDocumentId);
  }, []);

  const decodeBase64Url = (encodedWord) => {
    try {
      return atob(encodedWord);
    } catch (e) {
      console.log("Failed to decode URL:", e);
      return null;
    }
  };

  const decodedDocumentId = decodeBase64Url(documentId);

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

  const generatePdf = useReactToPrint({
    content: () => signatureRef.current,
    // documentTitle: document.documentName,
    onAfterPrint: () => message.success("Document Downloaded"),
  });
  return (
    <div>
      <h1>Final Document</h1>
      <Button type="primary" icon={<DownloadOutlined />} onClick={generatePdf}>
        Download as PDF
      </Button>
      <div
        ref={signatureRef}
        // dangerouslySetInnerHTML={{ __html: document.documentBody }}
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
  );
}