import axios from "axios";
import { useEffect, useRef, useState } from "react";
import baseUrl from "../../BootApi";
import "../CSS/allTemplates.css";
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
import {
  FileImageOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import CryptoJS from "crypto-js";
import { useForm } from "antd/es/form/Form";
import { AccessTemplates } from "./AccessTemplates";
import "./../CSS/Tables.css";
import Highlighter from "react-highlight-words";
import { SearchOutlined, ShareAltOutlined } from "@ant-design/icons";
import { log } from "util";

export function AllTemplate({ setCurrentView, setTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const [form] = useForm();
  // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const [accessTemplateId, setAccessTemplateId] = useState(null);
  const [accessTemplateName, setAccessTemplateName] = useState(null);
  const [accesses, setAccesses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [templateAccess, setTemplateAccess] = useState([]);
  const [access, setAccess] = useState("ALL");
  const [accessDetails, setAccessDetails] = useState([]);
  const [currnetUser, setCurrentUser] = useState();
  const [selectedSegment, setSelectedSegment] = useState("My Templates");
  const [allAccessTemplateId, setAllAccessTemplateId] = useState([]);

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
      console.error(error.response.data.errorMessage);
      // openNotificationW.ithIcon("error", "Failed to fetch templates");

    } finally {
      setLoading(false);
    }
  };

  async function getAllAccessTemplateId() {
    await axios
      .get(`${baseUrl}/accessControl/all/access/${userId}/templateId`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setAllAccessTemplateId(data))
      .catch((error) => console.log(error.reponse.data.message));
  }
  // console.log(allAccessTemplateId);

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

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
      console.error(error.response.data.errorMessage);
    }
  };

  async function getAllUserForAccess() {
    await axios
      .get(`${baseUrl}/api/v1/users/getallUser`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setAllUsers(data))
      .catch((error) => console.error(error.response.data.errorMessage));
  }
  // console.log(allUsers);

  useEffect(() => {
    getTemplate();
    getCurrentUser(Number(userId));
    getAllAccessTemplateId();
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
      console.error(error.response.data.errorMessage);
    }
  };

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
      width: "90px",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
      ...getColumnSearchProps("templateName"),
      width: "280px",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      width: "280px",
      render: (text) => {
        if (text) {
          const formattedDate = moment(text.createdAt).format("YYYY-MM-DD");
          const formattedTime = moment(text.createdAt).format("hh:mm A");
          return <span>{`${formattedDate} / ${formattedTime}`}</span>;
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
            icon={<EditOutlined />}
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

          <Button
            onClick={() => handleAccessClick(record)}
            style={{
              backgroundColor: allAccessTemplateId.includes(record.templateId)
                ? "#17B169"
                : "white",
              color: allAccessTemplateId.includes(record.templateId)
                ? "white"
                : "black",
            }}
            icon={<ShareAltOutlined />}
          >
            Share
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
      .catch((error) => console.error(error.response.data.errorMessage));
  }

  // console.log(templateAccess);

  function handleAccessClick(record) {
    setVisible(true);
    setAccessTemplateName(record.templateName);
    setAccessTemplateId(record.templateId);
    getAllUserForAccess();
  }

  useEffect(() => {
    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
  }, [accessTemplateId]);

  async function handleAccessEmail() {
    const userAlreadyHasAccess = templateAccess.some(
      (acc) => acc.userId === accessUserId
    );

    if (userAlreadyHasAccess) {
      message.warning(
        "User already has access to this template. Delete the old access."
      );
      return;
    }

    if (accessUserId == null || access == null) {
      message.warning("Please select the valid values");
      return;
    }

    const accessTemplate = {
      template: accessTemplateId,
      userId: accessUserId,
      templateAccess: access,
      ownerId: userId,
      ownerName: `${currnetUser.firstName} ${currnetUser.lastName}`,
    };
    // console.log(accessTemplate);

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
      console.error(error.response.data.errorMessage);
    }
    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
    getAllAccessTemplateId();
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
      .catch((error) => console.error(error.response.data.errorMessage));
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
        console.error(error.response.data.errorMessage);
        message.error(error.response.data.errorMessage);
      });

    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
    getAllAccessTemplateId();
  }

  // console.log(userId);

  return (
    <div style={{ padding: "20px", height: "85vh", margin: "20px" }}>
      {contextHolder}
      <Segmented
        options={["My Templates", "Shared Templates"]}
        value={selectedSegment}
        style={{ backgroundColor: "#01606F", color: "white" }}
        onChange={(value) => setSelectedSegment(value)}
        className="custom-segmented"
        size="medium"
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
            {/* <Title level={2}>My Templates</Title> */}

            <Table
              className="access-template-table"
              dataSource={templates}
              columns={columns}
              style={{ marginTop: "40px" }}
              rowKey="templateId"
              bordered
              scroll={{
                x: "1000px",
                y: "calc(100vh - 25rem)",
              }}
              pagination={{ pageSize: 5 }}
            />
          </div>
        </Spin>
      )}

      {selectedSegment === "Shared Templates" && (
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
          <Title level={5}>Access on: {accessTemplateName}</Title>
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
                defaultValue={
                  allUsers.filter((user) => user.userId !== userId)[0]
                    ?.userId || null
                } // Set the first user as the default value
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
                    label: "USE / SHARE",
                  },
                ]}
                defaultValue="ALL" // Set "ALL" as the default value
              />
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#01606F",
                  marginTop: "10px",
                  marginRight: "20px",
                }}
                icon={<ShareAltOutlined />}
              >
                Share
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
                >{`${access?.firstName} ${access?.lastName}`}</Text>
                <Text style={{ marginLeft: "10px" }}>
                  ({access.templateAccess})
                </Text>
                <Button
                  danger
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
