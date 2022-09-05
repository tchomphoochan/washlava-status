import axios from "axios";

const API = axios.create({ baseURL: "/api" });

export default {
  getMachines: () => API.get(`/machines`),
};
