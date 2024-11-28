const axios= require("axios");


export const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_URL, 
});
