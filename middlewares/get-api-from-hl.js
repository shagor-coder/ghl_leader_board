const dotenv = require("dotenv");
const { URLSearchParams } = require("url");
const { axios_for_api } = require("../helpers/axios-instance");
const create_error = require("../helpers/create-error");

dotenv.config();

const get_api_from_ghl = async (request, response, next) => {
  try {
    const code = request.query.code || "";
    if (!code) return next(create_error(401, "No code available!"));
    const encodedParams = new URLSearchParams();
    encodedParams.set("client_id", process.env.CLIENT_ID.trim());
    encodedParams.set("client_secret", process.env.CLIENT_SECRET.trim());
    encodedParams.set("grant_type", "authorization_code");
    encodedParams.set("code", code.trim());
    const { data } = await axios_for_api.post("/oauth/token", encodedParams);
    request.api_data = data;
    next();
  } catch (error) {
    next(create_error(500, error.stack));
  }
};

module.exports = get_api_from_ghl;
