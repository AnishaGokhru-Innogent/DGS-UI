
import React,{useEffect, useState}from "react";
import axios from "axios";
import baseUrl from "../../BootApi";
import { log } from "util";



const MyProfile = ()=>{
   
    const [user,setUser] = useState({});
    useEffect(() => {
        const id = localStorage.getItem("userId");
        getUserById(id);
    }, []);
    const bearerToken = localStorage.getItem("token");
    const getUserById = async(id)=>{
        const response = await axios.get(`${baseUrl}/api/v1/users/getUser/${id}`,{
            headers: { Authorization: `Bearer ${bearerToken}` },
        });
        setUser(response.data);
    }

    // const getDeptById = async()=>{
    //     const response = await axios.get
    // }

    

   console.log(user);
    return<>
       
       <h2>My Profile</h2>
       <div className="mt-4">
            <p>First Name : {user.firstName}</p>
            <p>Last Name : {user.lastName}</p>
            <p>Email : {user.email}</p>
            <p>Manager : {user.manager}</p>
            <p>Department : {user.department}</p>
            <p>Designation : {user.designation}</p>
       </div>
    </>
}

export default MyProfile;