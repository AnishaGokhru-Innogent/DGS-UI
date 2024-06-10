import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table } from "antd";
import Highlighter from "react-highlight-words";
import axios from "axios";
import { toast } from "react-toastify";

const AllUser = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUser, setAllUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    data();
  }, []);
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
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/department/getAll"
      );
      setDepartments(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/designation/getAll"
      );
      setDesignations(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };
  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      width: "15%",
      ...getColumnSearchProps("firstName"),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      width: "15%",
      ...getColumnSearchProps("lastName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "23%",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      ...getColumnSearchProps("departmentName"),
    },
    {
      title: "Designation",
      dataIndex: "designationName",
      key: "designationName",
      ...getColumnSearchProps("designationName"),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => <Button type="primary">Update</Button>,
    },
    {
      title: "Action",
      key: "action",

      render: (text, record) => <Button>Delete</Button>,
    },
  ];
  const token = localStorage.getItem("token");

  const data = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/v1/users/getallUser",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userWithDepartmentNames = response.data.map((user) => {
        const department = departments.find(
          (dept) => dept.departmentId === user.departmentId
        );
        const designation = designations.find(
          (des) => des.designationId === user.designationId
        );
        return {
          ...user,
          departmentName: department ? department.departmentName : "Unknown",
          designationName: designation
            ? designation.designationName
            : "Unknown",
        };
      });
      setAllUser(userWithDepartmentNames);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching User:", error);
    }
  };
  return (
    <>
      <h3>All User</h3>
      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={allUser}
          scroll={{
            x: "100%",
            y: 330,
          }}
        />
      </div>
    </>
  );
};

export default AllUser;
