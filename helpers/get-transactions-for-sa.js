const { axios_for_data } = require("./axios-instance");
const { check_expire_date } = require("./create-expire-date");

const get_transactions_for_sa = async ({ access_token, location_id }) => {
  try {
    const { data } = await axios_for_data.get("/payments/transactions", {
      params: {
        altId: location_id,
        altType: "location",
        limit: 1000,
      },
      headers: { Authorization: "Bearer " + access_token },
    });

    const obj = {
      transactions: data.data,
      location_id: location_id,
    };

    return obj;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = get_transactions_for_sa;
