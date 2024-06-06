const { URLSearchParams } = require("url");
const { axios_for_api } = require("./axios-instance");
const dotenv = require("dotenv");

dotenv.config();

const get_location_api_by_agency = async ({
  access_token,
  company_id,
  location_id,
}) => {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.set("companyId", company_id);
    encodedParams.set("locationId", location_id);
    const { data } = await axios_for_api.post(
      "/oauth/locationToken",
      encodedParams,
      {
        headers: {
          Version: "2021-07-28",
          Authorization: "Bearer " + access_token,
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const get_location_api_by_refresh_token = async ({
  refresh_token,
  location_id,
}) => {
  try {
    const encodedParams = new URLSearchParams();
    encodedParams.set("client_id", process.env.CLIENT_ID.trim());
    encodedParams.set("client_secret", process.env.CLIENT_SECRET.trim());
    encodedParams.set("grant_type", "refresh_token");

    const { data } = await axios_for_api.post(
      "/oauth/locationToken",
      encodedParams,
      {
        headers: {
          Authorization: "Bearer " + refresh_token,
        },
      }
    );
    return data;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  get_location_api_by_agency,
  get_location_api_by_refresh_token,
};
