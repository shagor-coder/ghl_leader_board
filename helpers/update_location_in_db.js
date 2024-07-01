const { db } = require("../firebase/app");
const { is_today_last_day } = require("./get-start-time-of-month");

const update_location_in_db = async (data) => {
  try {
    const {
      id,
      total_revenew,
      new_contacts,
      new_revenew,
      total_contacts,
      months,
    } = data;

    const month = new Date().getMonth();
    const { month: name_of_month } = is_today_last_day();

    const new_months = months.map((mon) => mon);

    new_months[month][name_of_month].total_contacts = new_contacts;
    new_months[month][name_of_month].total_revenew = new_revenew;

    const agency = await db.collection("locations").where("id", "==", id).get();

    await agency.docs[0].ref.update({
      total_revenew: total_revenew,
      total_contacts: total_contacts,
      months: new_months,
    });

    const response = await agency.docs[0].ref.get();

    return response.data();
  } catch (error) {
    throw new Error(error);
  }
};

const update_location_apis_in_db = async (data) => {
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

module.exports = { update_location_in_db, update_location_apis_in_db };
