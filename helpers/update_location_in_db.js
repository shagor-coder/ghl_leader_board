const { db } = require("../firebase/app");

const update_location_in_db = async ({ data }) => {
  try {
    const { id, ...other } = data;
    const doc_ref = db.collection("locations").doc();
    const location_ref = await doc_ref.get("id", "==", id);
    await location_ref.ref.update({
      ...other,
    });
    return id;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = update_location_in_db;
