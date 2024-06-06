const { db } = require("../firebase/app");

const check_in_db = async ({ collection_name, field_name, field_value }) => {
  try {
    const doc_ref = db.collection(collection_name);

    const query_snapshot = await doc_ref
      .where(field_name, "==", field_value)
      .get();
    return query_snapshot;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = check_in_db;
