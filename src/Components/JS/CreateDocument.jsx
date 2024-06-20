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
import {
  DownloadOutlined,
  SendOutlined,
  FileAddOutlined,
  BackwardOutlined
} from "@ant-design/icons";

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
    <div className="create-document-container ">
      <div className="d-flex justify-content-between">
      <div>
      <Button style={{backgroundColor:"#01606F",color:"white"}} icon={<BackwardOutlined/>} onClick={() => navigate("/home")}>HOME</Button>
      </div>
           <div >
            <Button
              type="primary"
              onClick={generatePdf}
              style={{ marginRight: "10px", backgroundColor: "#01606F" }}
              icon={<DownloadOutlined />}
            >
              Download Pdf
            </Button>
            <Button
              type="primary"
              onClick={saveDocument}
              icon={<SendOutlined />}
              style={{ backgroundColor: "#01606F" }}
            >
              Save & Send Email
            </Button>
          </div>
      
      </div>
     
      <div className="ms-5">
      <Row  gutter={24} style={{marginTop:"20px"}} >
        <Col span={9} style={{boxShadow:"2px 2px 2px 2px grey",padding:"20px"}} className="p-4">
          <div style={{textAlign:"center"}}>
          <h3>Create Document</h3>
          <hr style={{width:"440px",backgroundColor:"#01606F"}}></hr>
          </div>
          <div className="d-flex" style={{marginTop:"20px"}}>
            <h6 className="mt-1">Document Name:</h6>
            <Input
              style={{ width: "60%", marginBottom: "20px" ,marginLeft:"20px"}}
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter Document Name"
            />
          </div>
          <Form
            name="basic"
            // labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            autoComplete="on"
            onFinish={populateTemplate}
            style={{marginTop:"15px"}}
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
                    To
                    <Input type="email" placeholder="Receipient Email" />
                    <Tooltip title="Input valid Receipient Email for Signature">
                      <Typography.Link href="#API">Need Help? </Typography.Link>
                    </Tooltip>
                    {/* <Typography.Text type="secondary">
                        Please enter the email address of the recipient who needs
                        to sign this document.
                      </Typography.Text> */}
                  </Space>
                ) : (
                  <Input
                    type={field.placeholderType}
                    style={{width:"220px"}}
                    placeholder={`Enter ${field.placeholderName} value`}
                  />
                )}
              </Form.Item>
            ))}
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#01606F",marginRight:"150px",position:"relative",right:"150px"}}
                icon={<FileAddOutlined />}

              >
                Populate Template
              </Button>
              
            </Form.Item>
          </Form>
          
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
      </div>
     </div>
   
  );
}
