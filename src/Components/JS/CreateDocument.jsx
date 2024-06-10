import { Button, Form, Input } from "antd";
import axios from "axios";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { log } from "util";
import baseUrl from "../../BootApi";
import { toast } from "react-toastify";
export function CreateDocument() {
  const { id } = useParams();
  const [documentBody, setDocumentBody] = useState();
  const [fields, setFileds] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [formValues, setFormValues] = useState({});
  const documentPdf = useRef();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const navigate = useNavigate();
  async function getTemplateAndFields(templateId) {
    await axios
      .get(`${baseUrl}/template/get/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data.templateBody)
      .then((data) => setDocumentBody(data))
      .catch((error) => console.log(error));
    await axios
      .get(`${baseUrl}/placeholder/template/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setFileds(data))
      .catch((error) => console.log(error));
  }
  useEffect(() => {
    getTemplateAndFields(id);
    // console.log(fields);
  }, [id]);
  async function populateTemplate(values) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      // console.log(key, value);
      formData.append(key, value);
    }
    await axios
      .post(`${baseUrl}/document/populate/${id}`, formData, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setDocumentBody(data))
      .catch((error) => console.log(error));
    setFormValues(values);
    console.log(documentBody);
  }
  const generatePdf = useReactToPrint({
    content: () => documentPdf.current,
    documentTitle: documentName,
    onAfterPrint: () => alert("Download PDF"),
  });
  const signatureEmails = fields
    .filter((filed) => filed.placeholderType === "signature")
    .map((field) => formValues[field.placeholder])
    .filter((email) => email);
  async function saveDocument() {
    const documentData = {
      documentName: documentName,
      documentBody: documentBody,
      status: "PENDING",
      templateId: id,

      userId: userId,
      signatureEmails: fields
        .filter((field) => field.placeholderType === "signature")
        .map((field) => formValues[field.placeholderName]),
    };
    // console.log(documentData);
    await axios
      .post(`${baseUrl}/document/save`, documentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      })
      .then((response) => 
        {
          toast.success("Email Send Succesfully")
        }
    )
      .catch((error) => console.log(error));
  }
  return (
    <div key={1}>
      <Button onClick={() => navigate("/home")}>HOME</Button>
      <h1>Create Document</h1>
      Enter Document Name:
      <Input
        style={{ width: "200px" }}
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
      />
      <br />
      <br />
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        autoComplete="on"
        onFinish={populateTemplate}
      >
        {fields.map((field, index) => (
          <Form.Item
            label={field.placeholderName}
            name={field.placeholderName}
            key={index}
            type={field.placeholderType}
            rules={[
              {
                required: true,
                message: "Please input valid value",
              },
            ]}
          >
            {field.placeholderType === "signature" ? (
              <div>
                <Input type="email" placeholder="Email Address" />
              </div>
            ) : (
              <div>
                <Input type={field.placeholderType}></Input>
              </div>
            )}
          </Form.Item>
        ))}
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Populate Template
          </Button>
        </Form.Item>
      </Form>
      <div style={{ border: "2px solid black", margin: "20px" }}>
        <div
          ref={documentPdf}
          dangerouslySetInnerHTML={{ __html: documentBody }}
          style={{
            color: "black",
            height: "auto",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
            padding: "20px",
            margin: "20px",
          }}
        ></div>
      </div>
      <Button onClick={generatePdf}>Download Pdf</Button>
      <Button onClick={saveDocument}>Save & Send Email</Button>
    </div>
  );
}
