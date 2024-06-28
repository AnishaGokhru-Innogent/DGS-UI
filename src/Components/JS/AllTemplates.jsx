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
  Select,
  Segmented,
  Typography,
  Skeleton,
} from "antd";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";
import { useForm } from "antd/es/form/Form";
import { AccessTemplates } from "./AccessTemplates";

export function AllTemplate({ setCurrentView, setTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const [form] = useForm();
  // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [accessTemplateId, setAccessTemplateId] = useState(null);
  const [accesses, setAccesses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [templateAccess, setTemplateAccess] = useState([]);
  const [access, setAccess] = useState();
  const [accessDetails, setAccessDetails] = useState([]);
  const [currnetUser, setCurrentUser] = useState();
  const [selectedSegment, setSelectedSegment] = useState("My Templates");

  const { Title, Text } = Typography;

  const [api, contextHolder] = notification.useNotification();

  const [visible, setVisible] = useState(false);

  const [accessUserId, setAccessUserId] = useState();

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
    // const encryptedTemplateId = encryptTemplateId(templateId);
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

  const getCurrentUser = async (userId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/users/getUser/${userId}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Failed to fetch current user data", error);
    }
  };

  async function getAllUserForAccess() {
    await axios
      .get(`${baseUrl}/api/v1/users/getallUser`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setAllUsers(data))
      .catch((error) => console.log(error));
  }
  // console.log(allUsers);

  useEffect(() => {
    getTemplate();
    getCurrentUser(Number(userId));
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
              {/* {formattedDate}
              {formattedTime} */}
              {`${formattedDate} / ${formattedTime}`}
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
            // style={{ backgroundColor: "#01606F", color: "white" }}
            type="primary"
            danger
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

          <Button onClick={() => handleAccessClick(record.templateId)}>
            Access
          </Button>
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
            onConfirm={() => deleteTemplate(record.templateId)}
            onCancel={() => message.error("Click on No")}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  async function getAllAccessOfTemplate(templateId) {
    await axios
      .get(`${baseUrl}/accessControl/template/access/user/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setTemplateAccess(data))
      .catch((error) => console.log(error));
  }

  // console.log(templateAccess);

  function handleAccessClick(templateId) {
    setVisible(true);
    setAccessTemplateId(templateId);
    getAllUserForAccess();
  }

  useEffect(() => {
    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
  }, [accessTemplateId]);

  async function handleAccessEmail() {
    const accessTemplate = {
      template: accessTemplateId,
      userId: accessUserId,
      templateAccess: access,
      ownerId: userId,
      ownerName: `${currnetUser.firstName} ${currnetUser.lastName}`,
    };
    console.log(accessTemplate);

    try {
      const response = await axios.post(
        `${baseUrl}/accessControl/addAccess`,
        accessTemplate,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      // console.log(response);
      setAccesses((prevAccesses) => [...prevAccesses, response.data]);
    } catch (error) {
      console.log(error);
    }
    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
  }

  function handleAccess(value) {
    setAccess(value);
  }

  async function getAllAccessDetails(templateId) {
    await axios
      .get(`${baseUrl}/accessControl/template/access/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((reponse) => reponse.data)
      .then((data) => setAccessDetails(data))
      .catch((error) => console.log(error));
  }

  // console.log(accessDetails);

  const mergedData = templateAccess
    .map((item) => {
      if (item.userId !== userId) {
        const details = accessDetails.find(
          (detail) => detail.userId === item.userId
        );
        return { ...item, ...details };
      }
      return null;
    })
    .filter((item) => item !== null);

  async function deleteAccess(accessId) {
    await axios
      .delete(`${baseUrl}/accessControl/delete/access/${accessId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data, message.success("Access Deleted"))
      .catch((error) => {
        console.log(error);
        message.error("Error Occurred");
      });

    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
  }
  
  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}
      <Segmented
        options={["My Templates", "Access Templates"]}
        value={selectedSegment}
        onChange={(value) => setSelectedSegment(value)}
        size="large"
        block
      />
      {selectedSegment === "My Templates" && (
        <Spin spinning={loading}>
          <div
            className="mt-4"
            style={{
              marginTop: "20px",
            }}
          >
            <Title level={2}>My Templates</Title>

            <Table
              dataSource={templates}
              columns={columns}
              rowKey="templateId"
              bordered
              scroll={{
                x: "100%",
                y: "100%",
              }}
              pagination={{ pageSize: 5 }}
            />
          </div>
        </Spin>
      )}

      {selectedSegment === "Access Templates" && (
        <Spin spinning={loading}>
          <div
            className="mt-4"
            style={{
              marginTop: "20px",
            }}
          >
            <AccessTemplates
              setCurrentView={setCurrentView}
              setTemplateId={setTemplateId}
            />
          </div>
        </Spin>
      )}

      <Modal
        open={visible}
        footer={(_, {}) => (
          <>
            <Button onClick={() => setVisible(false)}>Close</Button>
          </>
        )}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} onFinish={handleAccessEmail}>
          <Title level={5}>Access on {document.documentName}</Title>
          <Form.Item
            label="Name"
            name="Name"
            rules={[{ required: true, message: "Please input valid Name" }]}
          >
            <Space wrap>
              <Select
                style={{ width: 240 }}
                showSearch
                placeholder="Select a person"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allUsers
                  .filter((user) => user.userId != userId) // Filter out the logged-in user
                  .map((user) => ({
                    label: `${user.firstName} ${user.lastName}`,
                    value: user.userId,
                  }))}
                onChange={(e) => setAccessUserId(e)}
              />
              <Select
                style={{ width: 120 }}
                onChange={handleAccess}
                options={[
                  {
                    value: "ALL",
                    label: "ALL",
                  },
                  {
                    value: "EDIT",
                    label: "EDIT",
                  },
                  {
                    value: "SHARE",
                    label: "SHARE",
                  },
                ]}
              />
              <Button type="primary" htmlType="submit">
                Send
              </Button>
            </Space>
          </Form.Item>
          <List
            bordered
            dataSource={mergedData}
            renderItem={(access) => (
              <List.Item style={{ padding: "5px 10px" }}>
                <Text
                  style={{ fontSize: "14px" }}
                >{`${access.firstName} ${access.lastName}`}</Text>
                <Text style={{ marginLeft: "10px" }}>
                  ({access.templateAccess})
                </Text>
                <Button
                  style={{ marginLeft: "auto" }}
                  onClick={() => deleteAccess(access.accessControlId)}
                >
                  <DeleteOutlined />
                </Button>
              </List.Item>
            )}
          />
        </Form>
      </Modal>
    </div>
  );
}
