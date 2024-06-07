const { axios_for_data } = require("../helpers/axios-instance");
const create_error = require("../helpers/create-error");

const get_all_locations = async (request, response, next) => {
  try {
    const { access_token, companyId } = request.api_data;
    const api_request = await axios_for_data.get("/locations/search", {
      headers: {
        Authorization: "Bearer " + access_token,
      },
      params: { companyId: companyId, limit: 1000 },
    });
    const data = await api_request.data;
    request.locations = data.locations;
    next();
  } catch (error) {
    next(create_error(500, error.stack));
  }
};

module.exports = get_all_locations;
