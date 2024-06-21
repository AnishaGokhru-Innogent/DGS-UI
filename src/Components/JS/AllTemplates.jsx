import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import {
  Button,
  Space,
  Table,
  notification,
  Popconfirm,
  message,
  Spin,
  Modal,
  Form,
  Input,
  List,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  MailOutlined,
  FileImageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import CryptoJS from "crypto-js";
import Item from "antd/es/list/Item";
import Title from "antd/es/skeleton/Title";
import { addListener } from "@reduxjs/toolkit";
import { useForm } from "antd/es/form/Form";

export function AllTemplate({ setCurrentView, setTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const [form] = useForm();
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [api, contextHolder] = notification.useNotification();

  const [visible, setVisible] = useState(false);

  const [accessEmail, setAccessEmail] = useState();

  const secretKey =
    "sD3rReEbZ+kjdUCCYD9ov/0fBb5ttGwzzZd1VRBmFwFAUTo3gwfBxBZ3UwngzTFn";

  const urlSafeBase64Encode = (str) => {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const encryptTemplateId = (templateId) => {
    const stringTemplateId = String(templateId);

    // console.log("Encrypting TemplateId:", stringTemplateId);

    const encrypted = CryptoJS.AES.encrypt(
      stringTemplateId,
      secretKey
    ).toString();
    return urlSafeBase64Encode(encrypted);
  };

  const handleUseClick = (templateId) => {
    const encryptedTemplateId = encryptTemplateId(templateId);
    navigate(`/create-document/${encryptedTemplateId}`);
  };

  const handleEditClick = (templateId) => {
    const encryptedTemplateId = encryptTemplateId(templateId);
    // navigate(`/edit-template/${encryptedTemplateId}`);
    setTemplateId(templateId);
    setCurrentView("EditTemplate");
  };

  const openNotificationWithIcon = (type, msg) => {
    api[type]({
      message: msg,
    });
  };

  const getTemplate = async () => {
    try {
      const response = await axios.get(`${baseUrl}/template/all/${userId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
      openNotificationWithIcon("error", "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTemplate();
  }, []);

  const deleteTemplate = async (id) => {
    try {
      await axios.delete(`${baseUrl}/template/deleteTemplate/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      message.success("Template deleted successfully");
      setTemplates((prevTemplates) =>
        prevTemplates.filter((temp) => temp.templateId !== id)
      );
    } catch (error) {
      message.error("Template not deleted");
    }
  };

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
      width: "80px",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      render: (text) => {
        if (text) {
          const formattedDate = moment(text.createdAt).format("YYYY-MM-DD");
          const formattedTime = moment(text.createdAt).format("hh:mm A");
          return (
            <span>
              {formattedDate}
              <br />
              {formattedTime}
            </span>
          );
        }
        return null;
      },
      sorter: (a, b) => moment(b.createdAt).diff(moment(a.createdAt)),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            style={{ backgroundColor: "#01606F", color: "white" }}
            onClick={() => handleEditClick(record.templateId)}
          >
            Edit
          </Button>
          <Button
            icon={<FileImageOutlined />}
            style={{ backgroundColor: "#01606F", color: "white" }}
            onClick={() => handleUseClick(record.templateId)}
          >
            Use
          </Button>
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
            onConfirm={() => deleteTemplate(record.templateId)}
            onCancel={() => message.error("Click on No")}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
          <Button onClick={() => setVisible(true)}>Access</Button>
        </Space>
      ),
    },
  ];

  function handleAccessEmail() {
    // form
    //   .validateFields()
    //   .then((values) => {
    //     const AccessObject = {
    //       template
    //     }
    //     axios.post(`${baseUrl}/accessControl/addAccess`);
    //   })
    //   .catch((error) => console.log(error));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Templates</h2>
      {contextHolder}
      <Spin spinning={loading}>
        <div
          className="mt-4"
          style={{
            marginTop: "20px",
          }}
        >
          <Table
            dataSource={templates}
            columns={columns}
            rowKey="templateId"
            bordered
            scroll={{
              x: "100%",
              y: 330,
            }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Spin>

      <Modal open={visible} onCancel={() => setVisible(false)}>
        <Form form={form} onFinish={handleAccessEmail}>
          <Title level={5}>Access on {document.documentName}</Title>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              {
                type: "email",
                message: "Please enter a valid email!",
              },
              {
                pattern: emailPattern,
                message: "Email does not match the required pattern!",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Email"
              prefix={<MailOutlined />}
              style={{ width: "270px" }}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Send
          </Button>
          <List bordered />
        </Form>
      </Modal>
    </div>
  );
}
