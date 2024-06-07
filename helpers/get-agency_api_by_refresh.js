const dotenv = require("dotenv");
const { URLSearchParams } = require("url");
const { axios_for_api } = require("../helpers/axios-instance");

dotenv.config();

const get_agency_api_by_refresh = async (refresh_token) => {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.set("client_id", process.env.CLIENT_ID.trim());
    encodedParams.set("client_secret", process.env.CLIENT_SECRET.trim());
    encodedParams.set("grant_type", "refresh_token");
    encodedParams.set("refresh_token", refresh_token.trim());
    const { data } = await axios_for_api.post("/oauth/token", encodedParams);
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = get_agency_api_by_refresh;
