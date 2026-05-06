import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/auth";
import { useEffect, useState } from "react";
import "./Home.css";
import DetectionPage from "./DetectionPage";


const Home = () => {
    const {userData, cookies, isEmpty} = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if(isEmpty(userData) && isEmpty(cookies)) navigate("/signup")
    },[userData,cookies])

    return (
        <DetectionPage/>
    );
}

export default Home;
