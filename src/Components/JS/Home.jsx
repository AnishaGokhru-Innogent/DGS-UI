import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LayoutOutlined,
    PlusOutlined,
    UserOutlined,
    BookOutlined,
    HomeOutlined,
    ContactsOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd'
const { Header, Sider, Content } = Layout;

const Home = () => {
    
    const [collapsed, setCollapsed] = useState(false);
    const [user,setUser] = useState({});
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const userId = localStorage.getItem('userId');
    useEffect(()=>{
        userName();
    },[])
    const userName = async()=>{
        await axios.get(`http://localhost:8080/api/v1/users/getUser/${userId}`).then(
              (response)=>{
                  setUser(response.data);
                //   console.log(response.data);
              }
        ).catch((error)=>{
            console.log(error);
        })
    }
    return (
        <Layout style={{height:"100vh"}}>
            <Sider trigger={null} collapsible collapsed={collapsed} >
                <div className="demo-logo-vertical" />
                <Menu
                    // theme="dark"
                    style={{backgroundColor:"#589A65",height:"100vh"}}
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[    
                        {
                            key: '1',
                            icon: <UserOutlined />,
                            label: `${user.firstName}`,
                        },
                        {
                            key: '2',
                            label: 'DocMaster',
                            style:{color:"white",fontSize:"21px"}
                        },
                        {
                            key: '3',
                            icon: <PlusOutlined />,
                            label: 'New Template',
                            style:{color:"white"}
                        },
                        {
                            key: '4',
                            icon: <HomeOutlined />,
                            label: 'Home',
                            style:{color:"white"}
                        },
                        {
                            key: '5',
                            icon: <BookOutlined />,
                            label: 'My Documents',
                            style:{color:"white"}
                        },
                        {
                            key: '6',
                            icon: <LayoutOutlined />,
                            label: 'Templates',
                            style:{color:"white"}
                        },
                        {
                            key: '7',
                            icon: <ContactsOutlined />,
                            label: 'Contact Us',
                            style:{color:"white"}
                        },
                        {
                            key: '8',
                            icon: <LogoutOutlined />,
                            label: 'LogOut',
                            style:{color:"white"}
                        },
                    ]}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    Content
                </Content>
            </Layout>
        </Layout>
    );

}

export default Home;