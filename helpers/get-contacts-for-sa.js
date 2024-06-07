const { axios_for_data } = require("./axios-instance");

const get_contacts_for_sa = async ({
  access_token,
  location_id,
  startAfter = 1717178400000,
}) => {
  try {
    const { data } = await axios_for_data.get("/contacts/", {
      params: { locationId: location_id, startAfter: startAfter },
      headers: { Authorization: "Bearer " + access_token },
    });

    const total_contacts = data.meta.total;

    return { total_contacts, location_id };
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = get_contacts_for_sa;
