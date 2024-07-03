// import { Button, Popconfirm, Space, Table, message } from "antd";
import axios from "axios";
import baseUrl from "../../BootApi";
import { useEffect, useRef, useState } from "react";
import { log } from "util";
import moment from "moment";
import {
  FileImageOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
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
  ConfigProvider,
} from "antd";
import { useForm } from "antd/es/form/Form";
import "./../CSS/Tables.css";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

export function AccessTemplates({ setCurrentView, setTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [access, setAccess] = useState([]);
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const [accessTemplateId, setAccessTemplateId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [form] = useForm();
  const { Title, Text } = Typography;
  const [accessUserId, setAccessUserId] = useState();
  const [currnetUser, setCurrentUser] = useState();
  const [accesses, setAccesses] = useState([]);
  const [templateAccess, setTemplateAccess] = useState([]);
  const [accessDetails, setAccessDetails] = useState([]);
  const [accessTemplate, setAccessTemplate] = useState();
  const [accessValue, setAccessValue] = useState("ALL");

  const secretKey =
    "sD3rReEbZ+kjdUCCYD9ov/0fBb5ttGwzzZd1VRBmFwFAUTo3gwfBxBZ3UwngzTFn";

  const urlSafeBase64Encode = (str) => {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

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

  async function getAccessAndTemplates() {
    try {
      const [templatesResponse, accessResponse] = await Promise.all([
        axios.get(`${baseUrl}/accessControl/access-template/${userId}`, {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }),
        axios.get(`${baseUrl}/accessControl/access/${userId}`, {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }),
      ]);
      setTemplates(templatesResponse.data);
      setAccess(accessResponse.data);
    } catch (error) {
      console.log(error);
    }
  }
  function handleAccess(value) {
    setAccessValue(value);
  }

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

  useEffect(() => {
    getAccessAndTemplates();
  }, []);

  const mergedDataTable = templates.map((template) => {
    const accessDetails =
      access.find((a) => a.template === template.templateId) || {};
    return { ...template, ...accessDetails };
  });

  // console.log(mergedData);

  const encryptTemplateId = (templateId) => {
    const stringTemplateId = String(templateId);

    // console.log("Encrypting TemplateId:", stringTemplateId);

    const encrypted = CryptoJS.AES.encrypt(
      stringTemplateId,
      secretKey
    ).toString();
    return urlSafeBase64Encode(encrypted);
  };

  async function getAllAccessDetails(templateId) {
    await axios
      .get(`${baseUrl}/accessControl/template/access/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((reponse) => reponse.data)
      .then((data) => setAccessDetails(data))
      .catch((error) => console.log(error));
  }

  async function getAllUserForAccess() {
    await axios
      .get(`${baseUrl}/api/v1/users/getallUser`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setAllUsers(data))
      .catch((error) => console.log(error));
  }

  async function getAllAccessOfTemplate(templateId) {
    await axios
      .get(`${baseUrl}/accessControl/template/access/user/${templateId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((response) => response.data)
      .then((data) => setTemplateAccess(data))
      .catch((error) => console.log(error));
  }

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

    console.log(accessTemplate);

    const template = {
      template: accessTemplate.templateId,
      userId: accessUserId,
      templateAccess: accessValue,
      ownerId: accessTemplate.ownerId,
      ownerName: accessTemplate.ownerName,
    };
    console.log(template);

    try {
      const response = await axios.post(
        `${baseUrl}/accessControl/addAccess`,
        template,
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

  const checkEditAccess = (access) => {
    return access !== "ALL" && access !== "EDIT";
  };

  const checkUseAccess = (access) => {
    return access !== "ALL" && access !== "SHARE";
  };

  const checkAccessAccess = (access) => {
    return access !== "ALL" && access !== "SHARE";
  };

  const handleEditClick = (templateId) => {
    setTemplateId(templateId);
    setCurrentView("EditTemplate");
  };

  const handleUseClick = (templateId) => {
    const encryptedTemplateId = encryptTemplateId(templateId);
    navigate(`/create-document/${encryptedTemplateId}`);
  };

  function handleAccessClick(record) {
    setVisible(true);
    setAccessTemplateId(record.templateId);
    setAccessTemplate(record);
    getAllUserForAccess();
  }

  useEffect(() => {
    getAllAccessOfTemplate(Number(accessTemplateId));
    getAllAccessDetails(Number(accessTemplateId));
  }, [accessTemplateId]);

  const mergedData = templateAccess
    .map((item) => {
      if (item.userId != userId) {
        const details = accessDetails.find(
          (detail) => detail.userId === item.userId
        );
        return { ...item, ...details };
      }
      return null;
    })
    .filter((item) => item !== null);

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
      ...getColumnSearchProps("templateName"),
    },
    {
      title: "Created By",
      dataIndex: "ownerName",
      key: "ownerName",
      ...getColumnSearchProps("ownerName"),
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
              <br />
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
            type="primary"
            danger
            disabled={checkEditAccess(record.templateAccess)}
            onClick={() => handleEditClick(record.templateId)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            icon={<FileImageOutlined />}
            style={{ backgroundColor: "#01606F", color: "white" }}
            disabled={checkUseAccess(record.templateAccess)}
            onClick={() => handleUseClick(record.templateId)}
          >
            Use
          </Button>
          <Button
            disabled={checkAccessAccess(record.templateAccess)}
            onClick={() => handleAccessClick(record)}
            style={{
              backgroundColor: "#17B169",
              color: "white",
            }}
          >
            Share
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      {/* <Title level={2}>Access Templates</Title> */}
      <div>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                rowHoverBg: "#fafafa",
              },
            },
          }}
        >
          <Table
            className="access-template-table"
            dataSource={mergedDataTable}
            columns={columns}
            style={{ marginTop: "40px" }}
            bordered
            scroll={{
              x: "1000px",
              y: "calc(100vh - 25rem)",
            }}
            pagination={{ pageSize: 5 }}
          />
        </ConfigProvider>
      </div>
      <Modal
        open={visible}
        footer={(_, {}) => (
          <>
            <Button onClick={() => setVisible(false)}>Close</Button>
          </>
        )}
        onCancel={() => setVisible(false)}
      >
        {" "}
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
                defaultValue={
                  allUsers.filter((user) => user.userId != userId)[0]?.userId ||
                  null
                }
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
                defaultValue="ALL"
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
                {userId != access.userId && (
                  <Button
                    style={{ marginLeft: "auto" }}
                    onClick={() => deleteAccess(access.accessControlId)}
                  >
                    <DeleteOutlined />
                  </Button>
                )}
              </List.Item>
            )}
          />
        </Form>
      </Modal>
    </div>
  );
}
