import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  Tooltip,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import baseUrl from "../../BootApi";

const { Option } = Select;

const Register = ({ fetchUsers,allUser }) => {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [manager, setManager] = useState("");
  const [form] = Form.useForm();
  const [desName, setDesName] = useState("");
  const [deptName, setDeptName] = useState("");
  const bearerToken = localStorage.getItem("token");

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingDeptName, setEditingDeptName] = useState("");

  const [editingDesignation, setEditingDesignation] = useState("");
  const [editingDesName, setEditingDesName] = useState(null);

  const deptInputRef = useRef(null);
  const desInputRef = useRef(null);

  const onNameDeptChange = (event) => {
    setDeptName(event.target.value);
  };

  const onNameDesChange = (event) => {
    setDesName(event.target.value);
  };

  const addItem = async (e) => {
    e.preventDefault();
    const designationData = {
      designationName: desName,
    };
    try {
      const response = await axios.post(
        `${baseUrl}/designation/add`,
        designationData,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDesignations([...designations, { designationName: desName }]);
      setDesName("");
      console.log(response.data);
      message.success("Designation Added");
    } catch (error) {
      message.error("Designation Not Added");
    }
  };

  const addItemDepartment = async (e) => {
    e.preventDefault();
    const departmentData = {
      departmentName: deptName,
    };
    try {
      const response = await axios.post(
        `${baseUrl}/department/addDept`,
        departmentData,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      setDepartments([...departments, { departmentName: deptName }]);
      setDeptName("");
      console.log(response.data);
      message.success("Department Added");
    } catch (error) {
      message.error("Department Not Added");
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    resetState();
  };

  const resetState = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setDepartmentName("");
    setDesignationName("");
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseUrl}/department/getAll`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${baseUrl}/designation/getAll`, {
        headers: { Authorization: `Bearer ${bearerToken}` },
      });
      setDesignations(response.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  const getDepartmentIdByName = async (name) => {
    try {
      const response = await axios.get(
        `${baseUrl}/department/getByName/${name}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      return response.data.departmentId;
    } catch (error) {
      console.error("Error fetching department by name:", error);
      message.error("Department Not Found");
      return null;
    }
  };

  const getDesignationByName = async (name) => {
    try {
      const response = await axios.get(
        `${baseUrl}/designation/getByName/${name}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      return response.data.designationId;
    } catch (error) {
      console.error("Error fetching designation by name:", error);
      message.error("Designation Not Found");
      return null;
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const handleRegister = async () => {
    const departmentId = await getDepartmentIdByName(departmentName);
    const designationId = await getDesignationByName(designationName);

    const registerData = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      manager: manager,
      manager: manager,
      departmentId: departmentId,
      designationId: designationId,
    };

    console.log("Register data:", registerData);
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/auth/register`,
        registerData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      message.success("Register Success");
      onClose();
      try {
        fetchUsers(departments, designations);
      } catch (error) {
        console.error("Error calling fetchUser:", error);
        message.error("Failed to fetch user data after registration");
      }
    } catch (error) {
      message.error("Register Failed");
    }
    window.location.reload();
  };

  const startEditingDepartment = (dept) => {
    setEditingDepartment(dept.departmentId);
    setEditingDeptName(dept.departmentName);
    setTimeout(() => deptInputRef.current?.focus(), 0);
  };

  const onChange = (value) => {
    console.log(`selected ${value}`);
    setManager(value);
  };
  const onSearch = (value) => {
    console.log('search:', value);
  };

  const startEditingDesignation = (des) => {
    setEditingDesignation(des.designationId);
    setEditingDesName(des.designationName);
    setTimeout(() => desInputRef.current?.focus(), 0);
  };

  const cancelEditingDepartment = () => {
    setEditingDepartment(null);
    setEditingDeptName("");
  };

  const cancelEditingDesignation = () => {
    setEditingDesignation(null);
    setEditingDesName("");
  };

  const saveEditingDepartment = async (dept) => {
    try {
      const response = await axios.put(
        `${baseUrl}/department/update/${dept.departmentId}`,
        { departmentName: editingDeptName },
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      const updatedDepartments = departments.map((d) =>
        d.departmentId === dept.departmentId
          ? { ...d, departmentName: editingDeptName }
          : d
      );
      setDepartments(updatedDepartments);
      message.success("Department Updated");
      cancelEditingDepartment();
    } catch (error) {
      console.error("Error updating department:", error);
      message.error("Department Update Failed");
    }
  };
  const saveEditingDesignation = async (des) => {
    try {
      const response = await axios.put(
        `${baseUrl}/designation/update/${des.designationId}`,
        { designationName: editingDesName },
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );
      const updatesDesignations = designations.map((d) =>
        d.designationId === des.designationId
          ? { ...d, designationName: editingDesName }
          : d
      );
      setDesignations(updatesDesignations);
      message.success("Designation Updated");
      cancelEditingDesignation();
    } catch (error) {
      console.error("Error updating Designation:", error);
      message.error("Designation Update Failed");
    }
  };

  return (
    <>
      <Button
        type="primary"
        onClick={showDrawer}
        icon={<PlusOutlined />}
        style={{ backgroundColor: "#01606F" }}
      >
        Create New User
      </Button>
      <Drawer
        title="Create a new account"
        width={450}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              style={{ backgroundColor: "#01606F", color: "white" }}
              onClick={handleRegister}
            >
              Register
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="firstname"
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
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="lastname"
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
              onChange={(e) => setLastName(e.target.value)}
            />
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
            {/* <Input
              placeholder="Please Enter Manager"
              onChange={(e) => setManager(e.target.value)}
            /> */}
            <Select
              showSearch
              placeholder="Select a Manager"
              optionFilterProp="label"
              onChange={(value) => {
                const selectedUser = allUser.find(user => user.userId === value);
                if (selectedUser) {
                  console.log("Selected manager name:", selectedUser.firstName); // Debug log to check value
                  setManager(selectedUser.firstName);
                }
              }}
              onSearch={onSearch}
              options={allUser.filter(user=>user.designationId===1)
                .map(user => ({
                label: user.firstName,
                value: user.userId,
              }))}
              
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
              style={{
                width: 385,
              }}
              placeholder="Department"
              onChange={(value) => setDepartmentName(value)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "8px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 8px 4px",
                    }}
                  >
                    <Input
                      placeholder="Please enter department"
                      ref={deptInputRef}
                      value={deptName}
                      onChange={onNameDeptChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItemDepartment}
                    >
                      Add Department
                    </Button>
                  </Space>
                </>
              )}
              options={departments.map((dept) => ({
                label: (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {editingDepartment === dept.departmentId ? (
                      <>
                        <Input
                          value={editingDeptName}
                          onChange={(e) => setEditingDeptName(e.target.value)}
                          style={{ marginRight: 8 }}
                          ref={deptInputRef}
                        />
                        <Button
                          icon={<SaveOutlined />}
                          onClick={() => saveEditingDepartment(dept)}
                          type="text"
                        />
                        <Button
                          icon={<CloseOutlined />}
                          onClick={cancelEditingDepartment}
                          type="text"
                        />
                      </>
                    ) : (
                      <>
                        {dept.departmentName}
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => startEditingDepartment(dept)}
                        />
                      </>
                    )}
                  </div>
                ),
                value: dept.departmentName,
              }))}
            />
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
            <Select
              style={{
                width: 385,
              }}
              placeholder="Designation"
              onChange={(value) => setDesignationName(value)}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider
                    style={{
                      margin: "8px 0",
                    }}
                  />
                  <Space
                    style={{
                      padding: "0 8px 4px",
                    }}
                  >
                    <Input
                      placeholder="Please enter Designation"
                      ref={desInputRef}
                      value={desName}
                      onChange={onNameDesChange}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={addItem}
                    >
                      Add Designation
                    </Button>
                  </Space>
                </>
              )}
              options={designations.map((des) => ({
                label: (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {editingDesignation == des.designationId ? (
                      <>
                        <Input
                          value={editingDesName}
                          onChange={(e) => setEditingDesName(e.target.value)}
                          style={{ marginRight: 8 }}
                          ref={desInputRef}
                        />
                        <Button
                          icon={<SaveOutlined />}
                          onClick={() => saveEditingDesignation(des)}
                          type="text"
                        />
                        <Button
                          icon={<CloseOutlined />}
                          onClick={cancelEditingDesignation}
                          type="text"
                        />
                      </>
                    ) : (
                      <>
                        {des.designationName}
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => startEditingDesignation(des)}
                        />
                      </>
                    )}
                  </div>
                ),
                value: des.designationName,
              }))}
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
              {
                type: "email",
                message: "Email is invalid",
              },
            ]}
          >
            <Input
              placeholder="Please Enter Email"
              onChange={(e) => setEmail(e.target.value)}
            />
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
          <Tooltip
            placement="rightTop"
            title="Password is automatically generated and send it on your email address."
          >
            <span style={{ marginLeft: "8px" }}> Password?</span>
          </Tooltip>
        </Form>
      </Drawer>
    </>
  );
};

export default Register;
