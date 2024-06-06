import axios from "axios";
import { useEffect, useState } from "react";
import baseUrl from "../../BootApi";
import { Button, Space, Table } from "antd";
import moment from "moment";

export function Alldocument() {
  const [documents, setDocuments] = useState();

  const userId = localStorage.getItem("userId");
  async function getDocumentsOfUser(Id) {
    await axios
      .get(`${baseUrl}/document/get-documents/${Id}`)
      .then((response) => response.data)
      .then((data) => setDocuments(data))
      .catch((error) => console.log(error));
  }

  useEffect(() => {
    getDocumentsOfUser(userId);
  }, []);
  console.log(documents);

  const columns = [
    {
      title: "Sno",
      key: "Sno",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Document Name",
      dataIndex: "documentName",
      key: "Document Name",
    },
    {
      title: "Date Of Creation",
      key: "createdAt",
      render: (text) => {
        if (text) {
          const formattedDate = moment(text).format("YYYY-MM-DD");
          const formattedTime = moment(text).format("hh:mm A");
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "Status",
    },
    {
      title: "",
      key: "use",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              // navigate(`/create-document/${record.templateId}`);
            }}
          >
            See
          </Button>
        </Space>
      ),
    },
    {
      title: "",
      key: "use",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            onClick={() => {
              // DeleteTemplate(record.templateId);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h1>All Document</h1>
      <div>
        <Table dataSource={documents} columns={columns} borderColor="black" />
      </div>
    </div>
  );
}
