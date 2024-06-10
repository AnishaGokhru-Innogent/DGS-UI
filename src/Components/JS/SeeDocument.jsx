import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import baseUrl from "../../BootApi";
import { log } from "util";
import { useReactToPrint } from "react-to-print";
import { Button, notification } from "antd";

export function Seedocument() {
  const bearerToken = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const [document, setDocument] = useState({});
  const [signatures, setSignatures] = useState([]);
  const signatureRef = useRef();

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
    <div>
      {contextHolder}
      <h1>Document</h1>

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
            // backgroundColor: "lightgrey",
            border: "2px solid black",
            width: "800px",
          }}
        ></div>
      </div>
      <Button onClick={() => generatePdf()}>Download</Button>
    </div>
  );
}
