const { db } = require("../firebase/app");

const add_data_in_db = async ({ collection_name, data }) => {
  try {
    const doc_ref = db.collection(collection_name).doc();

    const snapshot = await doc_ref.set({
      ...data,
    });
    return snapshot;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = add_data_in_db;
