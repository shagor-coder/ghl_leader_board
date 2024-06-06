const { db } = require("../firebase/app");

const add_data_in_db = async ({ collection_name, data }) => {
  try {
    const { companyId, locationId, ...other } = data;
    const doc_id = collection_name === "agencys" ? companyId : locationId;
    const doc_ref = db.collection(collection_name).doc(doc_id);
    const snapshot = await doc_ref.set({
      ...other,
    });
    return snapshot;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = add_data_in_db;
