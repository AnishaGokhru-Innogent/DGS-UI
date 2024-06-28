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
  Tag,
  Spin,
} from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FileImageOutlined, DeleteOutlined } from "@ant-design/icons";
import CryptoJS from "crypto-js";

export function Alldocument() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const bearerToken = localStorage.getItem("token");

  const [api, contextHolder] = notification.useNotification();

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
      openNotificationWithIcon("error", "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

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

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
      width: "80px",
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "documentName",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
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
          <Tag color={color} style={{ fontSize: "14px" }}>
            {record.status}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "view",
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
    console.log(e);
    message.error("Click on No");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Documents</h2>
      {contextHolder}
      <Spin spinning={loading}>
        <div
          className="mt-4"
          style={{ transform: "scale(1)", marginTop: "20px" }}
        >
          <Table
            dataSource={documents}
            columns={columns}
            rowKey="documentId"
            bordered
            scroll={{ x: "100%", y: 450 }}
            pagination={{ pageSize: 6 }}
          />
        </div>
      </Spin>
    </div>
  );
}
