const { db } = require("../firebase/app");

const update_data_in_db = async ({ collection_name, data }) => {
  try {
    const { companyId, ...other } = data;

    const agency = await db
      .collection(collection_name)
      .where("companyId", "==", companyId)
      .get();

    await agency.docs[0].ref.update({
      ...other,
    });

    return companyId;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = update_data_in_db;
