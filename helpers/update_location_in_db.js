const { db } = require("../firebase/app");

const update_location_in_db = async (data) => {
  try {
    const { id, access_token, refresh_token, expires_in } = data;

    const agency = await db.collection("locations").where("id", "==", id).get();
    await agency.docs[0].ref.update({
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: expires_in,
    });
    const response = await agency.docs[0].ref.get();
    return response.data();
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = update_location_in_db;
