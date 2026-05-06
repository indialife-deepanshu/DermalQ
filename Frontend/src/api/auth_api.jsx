import axios from "axios";
import server from "../environment";

const BASE_URL = server;
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
          "Content-Type": "application/json",
        },
    withCredentials: true,
})

export const postRegister = async (user) => {
    return await api.post("/register", user);
};

export const postLogin = async (user) => {
    return await api.post("/login", user);
}

export const postMessage = async (user) => {
    return await api.post("/feedback", user);
}

export const getUser = async () => {
    return await api.get("/user");
}

export const getHistoryOfUser = async () => {  
    return await api.get("/getUserHistory");
}

export const checkIsAdmin = async () => {
    return await api.get("/isAdmin");
}

export const getAdminDashboard = async () => {
    return await api.get("/admin/dashboard");
}


