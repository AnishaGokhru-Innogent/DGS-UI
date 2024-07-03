import React, { useEffect, useRef, useState } from "react";
import "../CSS/allUser.css";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  Space,
  Table,
  message,
  Popconfirm,
  Col,
  DatePicker,
  Drawer,
  Form,
  Row,
  Select,
} from "antd";

import Highlighter from "react-highlight-words";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { log } from "util";
import { icons } from "antd/es/image/PreviewGroup";
import Register from "./Register";
const { Option } = Select;

const AllUser = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUser, setAllUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [form] = Form.useForm();
  const [userId, setUserId] = useState(null);
  const bearerToken = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, designationsResponse] = await Promise.all([
          axios.get("http://localhost:8080/department/getAll", {
            headers: { Authorization: `Bearer ${bearerToken}` },
          }),
          axios.get("http://localhost:8080/designation/getAll", {
            headers: { Authorization: `Bearer ${bearerToken}` },
          }),
        ]);

        setDepartments(departmentsResponse.data);
        setDesignations(designationsResponse.data);

        await fetchUsers(departmentsResponse.data, designationsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
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

  const [open, setOpen] = useState(false);
  const showDrawer = (record) => {
    setUserId(record.userId);
    console.log(record.firstName);
    console.log(record.lastName);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      manager: record.manager,
      department: record.departmentName,
      designation: record.designationName,
      role: record.role,
    });
    setOpen(true);
  };
  const onClose = (id) => {
    setOpen(false);
  };
  const findDepartmentIdByName = (name) =>
    departments.find((dep) => dep.departmentName === name);
  const findDesignationByName = (name) =>
    designations.find((des) => des.designationName === name);

  const updateUser = async (values) => {
    console.log("Called");
    console.log(values);
    const department = findDepartmentIdByName(values.department);
    const designation = findDesignationByName(values.designation);

    const departmentId = department.departmentId;
    const designationId = designation.designationId;

    const updateData = {
      firstName: values.firstName,
      lastName: values.lastName,
      manager: values.manager,
      email: values.email,
      departmentId: departmentId,
      designationId: designationId,
    };
    console.log(updateData);
    try {
      let token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/v1/users/updateUser/${userId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        message.success("Updated Successfully");
        setOpen(false);
      }
      fetchUsers(departments, designations);
    } catch (error) {
      console.log(error);
    }
  };

  const confirm = async (id) => {
    try {
      let token = localStorage.getItem("token");
      console.log(id);
      const response = await axios.delete(
        `http://localhost:8080/api/v1/users/user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUser(allUser.filter((user) => user.userId != id));
      message.success("Deleted SuccessFully");
    } catch (error) {
      message.error("Something went wrong");
    }
  };
  const cancel = (e) => {
    console.log(e);
    message.error("Click on No");
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
            Close
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

  const fetchUsers = async (departments, designations) => {
    try {
      const token = localStorage.getItem("token");
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
      console.log("Users Fetched");
    } catch (error) {
      message.error("Error fetching users:", error);
    }
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      width: "12%",
      ...getColumnSearchProps("firstName"),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      width: "12%",
      ...getColumnSearchProps("lastName"),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "22%",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
      width: "13%",
      ...getColumnSearchProps("manager"),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: "13%",
      ...getColumnSearchProps("departmentName"),
    },
    {
      title: "Designation",
      dataIndex: "designationName",
      key: "designationName",
      width: "15%",
      ...getColumnSearchProps("designationName"),
    },
    {
      title: "",
      key: "action",
      width: "6%",
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => showDrawer(record)}
          style={{ backgroundColor: "#01606F" }}
          icon={<EditOutlined />}
        ></Button>
      ),
    },
    {
      title: "",
      key: "action",
      render: (text, record) => (
        <Popconfirm
          title="Delete User"
          description="Are you sure to delete this User?"
          onConfirm={() => confirm(record.userId)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined />}></Button>
        </Popconfirm>
      ),
    },
  ];
  console.log(allUser);
  return (
    <div style={{height:"86vh"}}>
      <Register fetchUsers={fetchUsers} allUser={allUser}/>
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
      <Drawer
        title="Update User"
        width={450}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          onFinish={updateUser}
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              {
                required: true,
                message: "Please Enter First name",
              },
            ]}
          >
            <Input placeholder="Please Enter First Name" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              {
                required: true,
                message: "Please Enter Last name",
              },
            ]}
          >
            <Input placeholder="Please Enter Last name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Please Enter Email",
              },
            ]}
          >
            <Input placeholder="Please Enter Email" />
          </Form.Item>
          <Form.Item
            name="manager"
            label="Manager"
            rules={[
              {
                required: true,
                message: "Please Enter Manager",
              },
            ]}
          >
            <Input placeholder="Please Enter Email" />
          </Form.Item>
          <Form.Item
            name="manager"
            label="Manager"
            rules={[
              {
                required: true,
                message: "Please Enter Manager",
              },
            ]}
          >
            <Input placeholder="Please Enter Email" />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[
              {
                required: true,
                message: "Please select an department",
              },
            ]}
          >
            <Select placeholder="Please select an department">
              {departments.map((dep) => (
                <Option key={dep.departmentName} value={dep.departmentName}>
                  {dep.departmentName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="designation"
            label="Designation"
            rules={[
              {
                required: true,
                message: "Please choose the designation",
              },
            ]}
          >
            <Select placeholder="Please choose the designation">
              {designations.map((des) => (
                <Option key={des.designationName} value={des.designationName}>
                  {des.designationName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[
              {
                required: true,
                message: "Please select an role",
              },
            ]}
          >
            <Select placeholder="Please select an role">
              <Option value="admin">ADMIN</Option>
              <Option value="user">USER</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                htmlType="submit"
                icon={<EditOutlined />}
                style={{ backgroundColor: "#01606F", color: "white" }}
              >
                Update
              </Button>
              <Button onClick={onClose} style={{ marginLeft: "15px" }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AllUser;
