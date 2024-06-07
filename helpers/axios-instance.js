const axios = require("axios").default;
const dotenv = require("dotenv");
dotenv.config();

const axios_for_data = axios.create({
  method: "GET",
  params: "",
  headers: {
    Accept: "application/json",
    version: "2021-07-28",
  },
  baseURL: process.env.AXIOS_BASE_URL,
});

const axios_for_api = axios.create({
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  },
  baseURL: process.env.AXIOS_BASE_URL.trim(),
});

module.exports = { axios_for_data, axios_for_api };
