
import React, { useEffect, useRef, useState } from "react";
<<<<<<< HEAD
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Space, Table, message, Popconfirm, Drawer, Form, Select } from "antd";
=======
import { SearchOutlined , EditOutlined , DeleteOutlined} from "@ant-design/icons";
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
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
import Highlighter from "react-highlight-words";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD

=======
import { log } from "util";
import { icons } from "antd/es/image/PreviewGroup";
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
const { Option } = Select;

const AllUser = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUser, setAllUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
<<<<<<< HEAD
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [form] = Form.useForm();
  const [userId, setUserId] = useState(null);
  const [open, setOpen] = useState(false);

=======
  const [form] = Form.useForm();
  const [userId,setUserId] = useState(null);
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
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

<<<<<<< HEAD
  const showDrawer = (record) => {
    setUserId(record.userId);
=======
  const [open, setOpen] = useState(false);
  const showDrawer = (record) => {
    setUserId(record.userId);
    console.log(record.firstName);
    console.log(record.lastName);
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
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
<<<<<<< HEAD

  const onClose = () => {
    setOpen(false);
  };

  const findDepartmentIdByName = (name) => departments.find((dep) => dep.departmentName === name);
  const findDesignationByName = (name) => designations.find((des) => des.designationName === name);

  const updateUser = async () => {
    const department = findDepartmentIdByName(departmentName);
    const designation = findDesignationByName(designationName);
=======
  const onClose = (id) => {
    setOpen(false);
  };
  const findDepartmentIdByName=(name) => departments.find((dep)=>dep.departmentName===name);
  const findDesignationByName=(name) => designations.find((des)=>des.designationName===name);

  const updateUser = async(values)=>{
    console.log("Called");
    console.log(values);
    const department = findDepartmentIdByName(values.department);
    const designation = findDesignationByName(values.designation);
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b

    const departmentId = department.departmentId;
    const designationId = designation.designationId;

<<<<<<< HEAD
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
=======

    const updateData = {
       firstName:values.firstName,
       lastName:values.lastName,
       email:values.email,
       departmentId:departmentId,
       designationId:designationId
    }
    console.log(updateData);
    try{  
      let token = localStorage.getItem("token");
       const response = await axios.put(`http://localhost:8080/api/v1/users/updateUser/${userId}`,updateData,{
          headers:{Authorization :`Bearer ${token}` },
       });
      if(response.data){
        message.success("Updated Successfully");
        setOpen(false);
      }
      fetchUsers(departments,designations);
   }
   catch(error){
      console.log(error);
   }
 
  }

  const confirm = async (id) => {
    try {
      let token = localStorage.getItem("token");
      console.log(id);
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
      const response = await axios.delete(
        `http://localhost:8080/api/v1/users/user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
<<<<<<< HEAD
      setAllUser(allUser.filter((user) => user.userId !== id));
      message.success("Deleted Successfully");
=======
      setAllUser(allUser.filter((user) => user.userId != id));
      message.success("Deleted SuccessFully");
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
    } catch (error) {
      toast.error("Something went wrong");
    }
  };
<<<<<<< HEAD

  const cancelDelete = () => {
=======
  const cancel = (e) => {
    console.log(e);
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
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
<<<<<<< HEAD
      key: "updateAction",
      render: (text, record) => (
        <Button type="primary" onClick={() => showDrawer(record)} icon={<EditOutlined />}>
=======
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={()=>showDrawer(record)} icon={<EditOutlined/>}>
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
          Update
        </Button>
      ),
    },
    {
      title: "",
<<<<<<< HEAD
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
=======
      key: "action",
      render: (text, record) => (
        <Popconfirm
          title="Delete the task"
          description="Are you sure to delete this task?"
          onConfirm={() => confirm(record.userId)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button danger icon={<DeleteOutlined/>}>Delete</Button>
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
<<<<<<< HEAD
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
=======
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
        // extra={
        //   <Space>
        //     <Button onClick={onClose}>Cancel</Button>
        //     <Button htmlType="submit" icon={<EditOutlined/>} type="primary">
        //       Update
        //     </Button>
        //   </Space>
        // }
      >
        <Form layout="vertical" hideRequiredMark form={form} onFinish={updateUser}>
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
            <Input
              placeholder="Please Enter First Name"
            />
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
            <Input
              placeholder="Please Enter Last name"
            />
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
            <Input
              placeholder="Please Enter Email"
            />
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
            <Select
              placeholder="Please select an department"
            >
              {departments.map((dep) => (
                <Option key={dep.departmentName} value={dep.departmentName}>
                  {dep.departmentName}
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
                </Option>
              ))}
            </Select>
          </Form.Item>
<<<<<<< HEAD
          <Form.Item name="designation" label="Designation">
            <Select
              placeholder="Please select designation"
              value={designationName}
              onChange={(value) => setDesignationName(value)}
            >
              {designations.map((designation) => (
                <Option key={designation.designationId} value={designation.designationName}>
                  {designation.designationName}
=======
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
            <Select
              placeholder="Please choose the designation"
            >
              {designations.map((des) => (
                <Option key={des.designationName} value={des.designationName}>
                  {des.designationName}
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
                </Option>
              ))}
            </Select>
          </Form.Item>
<<<<<<< HEAD
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
=======
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
           <Button htmlType="submit" icon={<EditOutlined/>} type="primary">
              Update
            </Button>
            <Button onClick={onClose} style={{marginLeft:"15px"}}>Cancel</Button>
          </Space>
           </Form.Item>
>>>>>>> 14894ad48daa3bdd455e886cebd02a485945440b
        </Form>
      </Drawer>
    </>
  );
};

export default AllUser;
