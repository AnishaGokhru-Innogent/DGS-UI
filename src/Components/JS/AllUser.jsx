import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, message, Popconfirm, Drawer, Form, Select } from "antd";
import Highlighter from "react-highlight-words";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AllUser = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUser, setAllUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [form] = Form.useForm();
  const [userId, setUserId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [departmentsResponse, designationsResponse] = await Promise.all([
          axios.get("http://localhost:8080/department/getAll"),
          axios.get("http://localhost:8080/designation/getAll"),
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

  const showDrawer = (record) => {
    setUserId(record.userId);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      department: record.departmentName,
      designation: record.designationName,
      role: record.role,
    });
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const findDepartmentIdByName = (name) => departments.find((dep) => dep.departmentName === name);
  const findDesignationByName = (name) => designations.find((des) => des.designationName === name);

  const updateUser = async () => {
    const department = findDepartmentIdByName(departmentName);
    const designation = findDesignationByName(designationName);

    const departmentId = department.departmentId;
    const designationId = designation.designationId;

    const updateData = {
      firstName,
      lastName,
      email,
      departmentId,
      designationId,
    };

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
        fetchUsers(departments, designations);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const confirmDelete = async (id) => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8080/api/v1/users/user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUser(allUser.filter((user) => user.userId !== id));
      message.success("Deleted Successfully");
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const cancelDelete = () => {
    message.error("Click on No");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
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
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
      const response = await axios.get("http://localhost:8080/api/v1/users/getallUser", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userWithDepartmentNames = response.data.map((user) => {
        const department = departments.find((dept) => dept.departmentId === user.departmentId);
        const designation = designations.find((des) => des.designationId === user.designationId);
        return {
          ...user,
          departmentName: department ? department.departmentName : "Unknown",
          designationName: designation ? designation.designationName : "Unknown",
        };
      });

      setAllUser(userWithDepartmentNames);
      console.log("Users Fetched");
    } catch (error) {
      console.error("Error fetching users:", error);
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
      title: "",
      key: "updateAction",
      render: (text, record) => (
        <Button type="primary" onClick={() => showDrawer(record)} icon={<EditOutlined />}>
          Update
        </Button>
      ),
    },
    {
      title: "",
      key: "deleteAction",
      render: (text, record) => (
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => confirmDelete(record.userId)}
          onCancel={cancelDelete}
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={allUser} />
      <Drawer
        title="Update User"
        width={300}
        onClose={onClose}
        open={open}
        bodyStyle={{
          paddingBottom: 80,
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="firstName" label="First Name">
            <Input
              placeholder="Please enter user name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name">
            <Input
              placeholder="Please enter user name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input
              placeholder="Please enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="department" label="Department">
            <Select
              placeholder="Please select department"
              value={departmentName}
              onChange={(value) => setDepartmentName(value)}
            >
              {departments.map((department) => (
                <Option key={department.departmentId} value={department.departmentName}>
                  {department.departmentName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="designation" label="Designation">
            <Select
              placeholder="Please select designation"
              value={designationName}
              onChange={(value) => setDesignationName(value)}
            >
              {designations.map((designation) => (
                <Option key={designation.designationId} value={designation.designationName}>
                  {designation.designationName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label="Role">
            <Select>
              <Option value="ROLE_USER">ROLE_USER</Option>
              <Option value="ROLE_ADMIN">ROLE_ADMIN</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button onClick={updateUser} type="primary">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default AllUser;
