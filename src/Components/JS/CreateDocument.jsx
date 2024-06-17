import {
  Button,
  Form,
  Input,
  Col,
  Row,
  Typography,
  Tooltip,
  Space,
  message,
  Spin,
} from "antd";
import axios from "axios";
import { useRef, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import baseUrl from "../../BootApi";
import "../CSS/createDocument.css"; // Ensure you import your CSS for custom styling

export function CreateDocument() {
  const { id } = useParams();
  const [documentBody, setDocumentBody] = useState();
  const [fields, setFields] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [formValues, setFormValues] = useState({});
  const documentPdf = useRef();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function getTemplateAndFields(templateId) {
    try {
      const templateResponse = await axios.get(
        `${baseUrl}/template/get/${templateId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDocumentBody(templateResponse.data.templateBody);

      const fieldsResponse = await axios.get(
        `${baseUrl}/placeholder/template/${templateId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setFields(fieldsResponse.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getTemplateAndFields(id);
  }, [id]);

  async function populateTemplate(values) {
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) {
        formData.append(key, value);
      }
      const response = await axios.post(
        `${baseUrl}/document/populate/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDocumentBody(response.data);
      setFormValues(values);
    } catch (error) {
      console.error(error);
    }
  }

  const generatePdf = useReactToPrint({
    content: () => documentPdf.current,
    documentTitle: documentName,
    onAfterPrint: () => alert("Download PDF"),
  });

  async function saveDocument() {
    setLoading(true);
    const signatureEmails = fields
      .filter((field) => field.placeholderType === "signature")
      .reduce((acc, field) => {
        acc[field.placeholderName] = formValues[field.placeholderName];
        return acc;
      }, {});
    message.success("Document Saved");

    const documentData = {
      documentName: documentName,
      documentBody: documentBody,
      status: fields.some((field) => field.placeholderType === "signature")
        ? "PENDING"
        : "COMPLETED",
      templateId: id,
      userId: userId,
      signatureEmails: signatureEmails,
    };

    try {
      await axios.post(`${baseUrl}/document/save`, documentData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },
      });
      setLoading(false);
      message.success("Email Send");
    } catch (error) {
      console.error(error);
      message.error("Error Occurred in Saving Document and Sending Email");
    }
  }

  return (
    <div className="create-document-container">
      <Spin spinning={loading} size="large">
        <Button onClick={() => navigate("/home")}>HOME</Button>
        <Typography.Title level={2}>Create Document</Typography.Title>
        <Row gutter={24}>
          <Col span={10}>
            <Typography.Title level={4}>Enter Document Name:</Typography.Title>
            <Input
              style={{ width: "100%", marginBottom: "20px" }}
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter Document Name"
            />
            <Form
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              initialValues={{ remember: true }}
              autoComplete="on"
              onFinish={populateTemplate}
            >
              {fields.map((field, index) => (
                <Form.Item
                  label={field.placeholderName}
                  name={field.placeholderName}
                  key={index}
                  rules={[
                    {
                      required: true,
                      message: `Please input valid ${field.placeholderName.toLowerCase()}`,
                    },
                    field.placeholderType === "email" && {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  {field.placeholderType === "signature" ? (
                    // <Tooltip title="Enter the email of the person whose signature is required">
                    <Space direction="horizontal">
                      To:
                      <Input type="email" placeholder="Receipient Email" />
                      <Tooltip title="Input valid Receipient Email for Signature">
                        <Typography.Link href="#API">
                          Need Help?{" "}
                        </Typography.Link>
                      </Tooltip>
                      {/* <Typography.Text type="secondary">
                      Please enter the email address of the recipient who needs
                      to sign this document.
                    </Typography.Text> */}
                    </Space>
                  ) : (
                    <Input
                      type={field.placeholderType}
                      placeholder={`Enter ${field.placeholderName} value`}
                    />
                  )}
                </Form.Item>
              ))}
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Populate Template
                </Button>
              </Form.Item>
            </Form>
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <Button
                type="primary"
                onClick={generatePdf}
                style={{ marginRight: "10px" }}
              >
                Download Pdf
              </Button>
              <Button type="primary" onClick={saveDocument}>
                Save & Send Email
              </Button>
            </div>
          </Col>
          <Col span={14}>
            <div className="a4-paper">
              <div
                ref={documentPdf}
                dangerouslySetInnerHTML={{ __html: documentBody }}
                className="document-body"
              ></div>
            </div>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
