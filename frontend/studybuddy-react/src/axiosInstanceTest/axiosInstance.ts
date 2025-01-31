import axios from "axios";

const axiosInstance = axios.create();

let apiRequestCount = 0;

axiosInstance.interceptors.request.use((config) => {
  apiRequestCount += 1;
  console.log(`API Request Count: ${apiRequestCount}`);
  return config;
});

export default axiosInstance;
