// import React , { useEffect, useRef, useState }from "react";
// import { SearchOutlined } from '@ant-design/icons';
// import { Button, Input, Space, Table } from 'antd';
// import Highlighter from 'react-highlight-words';
// import axios from "axios";
// import { toast } from "react-toastify";

// const AllUser = ()=>{

//     const [searchText, setSearchText] = useState('');
//     const [searchedColumn, setSearchedColumn] = useState('');
//     const searchInput = useRef(null);
//     const [allUser , setAllUser] = useState([]);
//     const [departments, setDepartments] = useState([]);
//     const [designations, setDesignations] = useState([]);
//     useEffect(() => {
//         let fetchData = async () => {
//             try {
//                 await fetchDepartments();
//                 await fetchDesignations();
//                 await data();

//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             }
//         };

//         fetchData();
//     }, []);

//     const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//     };
//     const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText('');
//     };
//     const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
//         <div
//         style={{
//             padding: 8,
//         }}
//         onKeyDown={(e) => e.stopPropagation()}
//         >
//         <Input
//             ref={searchInput}
//             placeholder={`Search ${dataIndex}`}
//             value={selectedKeys[0]}
//             onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//             onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             style={{
//             marginBottom: 8,
//             display: 'block',
//             }}
//         />
//         <Space>
//             <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{
//                 width: 90,
//             }}
//             >
//             Search
//             </Button>
//             <Button
//             onClick={() => clearFilters && handleReset(clearFilters)}
//             size="small"
//             style={{
//                 width: 90,
//             }}
//             >
//             Reset
//             </Button>
//             <Button
//             type="link"
//             size="small"
//             onClick={() => {
//                 confirm({
//                 closeDropdown: false,
//                 });
//                 setSearchText(selectedKeys[0]);
//                 setSearchedColumn(dataIndex);
//             }}
//             >
//             Filter
//             </Button>
//             <Button
//             type="link"
//             size="small"
//             onClick={() => {
//                 close();
//             }}
//             >
//             close
//             </Button>
//         </Space>
//         </div>
//     ),
//     filterIcon: (filtered) => (
//         <SearchOutlined
//         style={{
//             color: filtered ? '#1677ff' : undefined,
//         }}
//         />
//     ),
//     onFilter: (value, record) =>
//         record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     onFilterDropdownOpenChange: (visible) => {
//         if (visible) {
//         setTimeout(() => searchInput.current?.select(), 100);
//         }
//     },
//     render: (text) =>
//         searchedColumn === dataIndex ? (
//         <Highlighter
//             highlightStyle={{
//             backgroundColor: '#ffc069',
//             padding: 0,
//             }}
//             searchWords={[searchText]}
//             autoEscape
//             textToHighlight={text ? text.toString() : ''}
//         />
//         ) : (
//         text
//         ),
//     });
//     const fetchDepartments = async () => {
//         try {
//             const response = await axios.get('http://localhost:8080/department/getAll');
//             setDepartments(response.data);
//             console.log("Department Fetched");
//             console.log(response.data);
//         } catch (error) {
//             console.error('Error fetching departments:', error);
//         }
//     };

//     const fetchDesignations = async () => {
//         try {
//             const response = await axios.get('http://localhost:8080/designation/getAll');
//             setDesignations(response.data);
//             console.log("Designation Fetched");
//             console.log(response.data);
//         } catch (error) {
//             console.error('Error fetching designations:', error);
//         }
//     };
//     const columns = [
//     {
//         title: 'First Name',
//         dataIndex: 'firstName',
//         key: 'firstName',
//         width: '15%',
//         ...getColumnSearchProps('firstName'),
//     },
//     {
//         title: 'Last Name',
//         dataIndex: 'lastName',
//         key: 'lastName',
//         width: '15%',
//         ...getColumnSearchProps('lastName'),
//     },
//     {
//         title: 'Email',
//         dataIndex: 'email',
//         key: 'email',
//         width:'23%',
//         ...getColumnSearchProps('email'),
//     },
//     {
//         title: 'Department',
//         dataIndex: 'departmentName',
//         key: 'departmentName',
//         ...getColumnSearchProps('departmentName'),
//     },
//     {
//         title: 'Designation',
//         dataIndex: 'designationName',
//         key: 'designationName',
//         ...getColumnSearchProps('designationName'),
//     },
//     {
//         title: 'Action',
//         key: 'action',
//         render: (text, record) => (
//             <Button type="primary">Update</Button>
//         ),
//     },
//     {
//         title :'Action',
//         key:'action',

//         render :(text,record)=>(
//             <Button>Delete</Button>
//         )
//     }

//     ];
//     const token = localStorage.getItem('token');

//     const data = async()=>{
//     try{
//         const response = await axios.get("http://localhost:8080/api/v1/users/getallUser",{
//             headers:{
//                 Authorization:`Bearer ${token}`
//             }
//         });
//         console.log(response.data);
//             const userWithDepartmentNames = response.data.map(user=>{
//                 console.log(departments);
//                 console.log(designations);
//                 const department = departments.find(dept=>dept.departmentId===user.departmentId);
//                 const designation = designations.find(des=>des.designationId === user.designationId);
//                 console.log(department);
//                 console.log(designation);
//                 return {
//                     ...user,
//                     departmentName : department ? department.departmentName :"Unknown",
//                     designationName : designation ? designation.designationName : "Unknown"

//                 };
//             })
//         setAllUser(userWithDepartmentNames);
//     }catch(error){
//         console.error('Error fetching User:', error);
//     }
//     }
//     return(
//         <>
//             {/* <h3>All User</h3> */}
//             <div className="mt-4">
//             <Table columns={columns} dataSource={allUser}
//                 scroll={{
//                     x: '100%',
//                     y: 330,
//                 }}
//             />
//             </div>
//         </>
//     );

// }

// export default AllUser;

import React, { useEffect, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
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
const { Option } = Select;

const AllUser = () => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [allUser, setAllUser] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  let id = "";
  const navigate = useNavigate();

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

  const [open, setOpen] = useState(false);
  const showDrawer = (userId) => {
    setOpen(true);
    id = userId;
  };
  const onClose = (id) => {
    setOpen(false);
   
  };

  const confirm = async (id) => {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8080/api/v1/users/user/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAllUser(allUser.filter((user) => user.userId != id));
      message.success("Deleted SuccessFully");
    } catch (error) {
      toast.error("Something went wrong");
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
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={()=>showDrawer(record.userId)}>
          Update
        </Button>
      ),
    },
    {
      title: "",
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
          <Button danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
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
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={onClose} type="primary">
              Update
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" hideRequiredMark>
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(value) => setDepartmentName(value)}
            >
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
            <Select
              placeholder="Please choose the designation"
              onChange={(value) => setDesignationName(value)}
            >
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
        </Form>
      </Drawer>
    </>
  );
};

export default AllUser;
