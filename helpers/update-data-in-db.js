const { db } = require("../firebase/app");

const update_data_in_db = async ({ collection_name, data }) => {
  try {
    const { companyId, ...other } = data;
    const doc_ref = db.collection(collection_name).doc(companyId);
    doc_ref.update({
      ...other,
    });
    return companyId;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = update_data_in_db;
