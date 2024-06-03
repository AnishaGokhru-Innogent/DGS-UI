        import React, { useState } from "react";
        import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
        import { Input, Button, Form } from 'antd';
        import axios from "axios";
        import { toast } from "react-toastify";
        import { useNavigate } from "react-router-dom";

        const Register = ()=>{
        const [email,setEmail] = useState('');
        const[password,setPassword] = useState('')
        const [size, setSize] = useState('large');
        const [firstName,setFirstName] = useState('');
        const [lastName,setLastName] = useState('');
        const [department,setDepartment] = useState();
        const [designation , setDesignation ] = useState()
        const handleRegister = async ()=>{
                const registerData = {
                        email:email,
                        password:password,
                        firstName:firstName,
                        lastName:lastName,
                        departmentId:department,
                        designationId:designation
                }
                console.log(registerData);
                await axios.post('http://localhost:8080/api/v1/auth/register',registerData).then(
                        (response)=>{
                                toast.success("Register Success");
                        }
                ).catch((error)=>{
                        console.log(error);
                        toast.error("Register Failed");
                })
        }
        return (
                <div className="main d-flex align-items-center justify-content-center">
                <div className="loginBox d-flex">
                        <div className="leftSection">
                                <Form onFinish={handleRegister}>
                                        <h1>WELCOME</h1>
                                        <p>We are glad to see you back with us</p>
                                        <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="Email"
                                                prefix={<MailOutlined />}
                                                value={email}
                                                onChange={(e)=>setEmail(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item>
                                        <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="Password"
                                                prefix={<LockOutlined />}
                                                value={password}
                                                onChange={(e)=>setPassword(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item>
                                        <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="First Name"
                                                prefix={<LockOutlined />}
                                                value={firstName}
                                                onChange={(e)=>setFirstName(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item>
                                        <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="Last Name"
                                                prefix={<LockOutlined />}
                                                value={lastName}
                                                onChange={(e)=>setLastName(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item>
                                        {/* <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="Department"
                                                prefix={<LockOutlined />}
                                                value={department}
                                                onChange={(e)=>setDepartment(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item>
                                        <Form.Item>
                                        <Input
                                                size="large"
                                                placeholder="Designation"
                                                prefix={<LockOutlined />}
                                                value={designation}
                                                onChange={(e)=>setDesignation(e.target.value)}
                                                style={{ width: '300px' }} />
                                        </Form.Item> */}
                                        <Form.Item>
                                        <Button  htmlType="submit" type="primary" icon={<LockOutlined />} size={size}>
                                                Sign Up
                                        </Button>
                                        </Form.Item>
                                </Form>
                        </div>
                        <div className="rightSection">

                        </div>
                </div>
        </div>
        )
        }

        export default Register;