import axios from "axios";
import { useEffect, useRef, useState } from "react";
import baseUrl from "../../BootApi";
import "../CSS/chooseCreateTemplate.css";
import {
  Button,
  Space,
  Table,
  notification,
  Popconfirm,
  message,
  Tag,
  Spin,
  Input,
} from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";
import "./../CSS/Tables.css";
import { log } from "util";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";

export function Alldocument() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);

  // console.log(documents);
  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");

  const [api, contextHolder] = notification.useNotification();

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

  const openNotificationWithIcon = (type, msg) => {
    api[type]({
      message: msg,
    });
  };

  const getDocumentsOfUser = async (id) => {
    try {
      const response = await axios.get(
        `${baseUrl}/document/get-documents/${id}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function getTemplatesOfUser(userId) {
    axios
      .get(`${baseUrl}/template/all/${userId}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      })
      .then((reponse) => reponse.data)
      .then((data) => setTemplates(data))
      .catch((error) => console.log(error));
  }

  const secretKey =
    "sD3rReEbZ+kjdUCCYD9ov/0fBb5ttGwzzZd1VRBmFwFAUTo3gwfBxBZ3UwngzTFn";

  const urlSafeBase64Encode = (str) => {
    return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const encryptDocumentId = (documentId) => {
    const stringDocumentId = String(documentId);

    console.log("Encrypting documentId:", stringDocumentId);

    const encrypted = CryptoJS.AES.encrypt(
      stringDocumentId,
      secretKey
    ).toString();
    return urlSafeBase64Encode(encrypted);
  };

  const handleViewClick = (documentId) => {
    const encryptedDocumentId = encryptDocumentId(documentId);
    // console.log(encryptedDocumentId);
    navigate(`/document/${encryptedDocumentId}`);
  };

  useEffect(() => {
    getDocumentsOfUser(userId);
    getTemplatesOfUser(userId);
  }, [userId]);

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`${baseUrl}/document/delete-doc/${id}`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      message.success("Document deleted successfully");
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc.documentId !== id)
      );
    } catch (error) {
      openNotificationWithIcon("error", "Error occurred in deletion");
    }
  };

  // const mergedTables = documents.map((doc) => {
  //   const template = templates.find(
  //     (temp) => temp.templateId === doc.templateId
  //   );
  //   return { ...doc, ...template };
  // });

  const templatesMap = templates.reduce((acc, template) => {
    acc[template.templateId] = template.templateName;
    return acc;
  }, {});

  const documentsWithTempalteName = documents.map((doc) => ({
    ...doc,
    templateName: templatesMap[doc.templateId],
  }));
  // console.log(documentsWithTempalteName);

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
      width: "60px",
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "documentName",
      width: "220px",
      ...getColumnSearchProps("documentName"),
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
      width: "220px",
      ...getColumnSearchProps("templateName"),
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      width: "220px",
      render: (text) => {
        if (text.createdAt) {
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
      title: "Status",
      key: "status",
      align: "center",
      filters: [
        { text: "SIGNED", value: "SIGNED" },
        { text: "PENDING", value: "PENDING" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_, record) => {
        let color = "magenta";
        if (record.status === "SIGNED") {
          color = "geekblue";
        }
        return (
          <Tag color={color} style={{ fontSize: "12px" }}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "view",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            style={{ backgroundColor: "#01606F", color: "white" }}
            icon={<FileImageOutlined />}
            onClick={() => handleViewClick(record.documentId)}
          >
            View
          </Button>
        </Space>
      ),
    },
    {
      title: "",
      key: "use",
      align: "center",
      render: (_, record) => (
        <Popconfirm
          title="Delete the document"
          description="Are you sure you want to delete this document?"
          onConfirm={() => deleteDocument(record.documentId)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const cancel = (e) => {
    // console.log(e);
    message.error("Click on No");
  };

  return (
    <div style={{ padding: "20px", height: "85vh" }}>
      <h3>All Documents</h3>
      {contextHolder}
      <Spin spinning={loading}>
        <div
          className="mt-4"
          style={{ transform: "scale(1)", marginTop: "20px" }}
        >
          <Table
            className="access-template-table"
            dataSource={documentsWithTempalteName}
            columns={columns}
            rowKey="documentId"
            bordered
            scroll={{
              x: "1000px",
              y: "calc(100vh - 25rem)",
            }}
            pagination={{ pageSize: 6 }}
          />
        </div>
      </Spin>
    </div>
  );
}
