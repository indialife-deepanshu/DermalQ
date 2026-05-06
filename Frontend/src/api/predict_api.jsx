import axios from "axios";
import server from "../environment";

const BASE_URL = server;
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

export const prediction = async (formData) => {
    return await api.post("/api/prediction/predict", formData);
}

export const skinReports = async (formData) => {
    // console.log(formData.data);
    return await api.post("/api/prediction/reports", formData);
}