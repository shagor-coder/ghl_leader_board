const { db } = require("../firebase/app");
const create_error = require("../helpers/create-error");
const get_contacts_for_sa = require("../helpers/get-contacts-for-sa");
const {
  get_start_time_of_month,
  is_today_last_day,
} = require("../helpers/get-start-time-of-month");
const get_transactions_for_sa = require("../helpers/get-transactions-for-sa");
const update_location_in_db = require("../helpers/update_location_in_db");

const get_locations_data = async (request, response, next) => {
  try {
    const companyId = request.query.companyId;
    if (!companyId)
      return next(create_error(401, "Please provide a companyId"));

    const doc_ref = db.collection("locations");

    const query_snapshots = await doc_ref
      .where("companyId", "==", companyId.trim())
      .get();

    if (query_snapshots.empty)
      return response
        .status(404)
        .json({ message: "No Location Found For This Company" });

    let locations = [];
    let contact_promises = [];
    let transaction_promises = [];

    query_snapshots.forEach((qs) => {
      locations.push(qs.data());
    });

    locations.forEach((location) => {
      const promise = get_transactions_for_sa({
        access_token: location.access_token,
        location_id: location.id,
      });
      transaction_promises.push(promise);
    });

    locations.forEach((location) => {
      const promise = get_contacts_for_sa({
        access_token: location.access_token,
        location_id: location.id,
        startAfter: get_start_time_of_month(),
      });

      contact_promises.push(promise);
    });

    const transactions_setteled = await Promise.allSettled(
      transaction_promises
    );
    const contacts_setteled = await Promise.allSettled(contact_promises);

    let location_with_contacts = [];
    let location_with_all_fields = [];

    let update_total_contats_promises = [];
    let update_total_revenew_promises = [];

    contacts_setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        let current_location = locations.find(
          (loc) => loc.id === data.location_id
        );

        const {
          name,
          firstName,
          lastName,
          total_contacts,
          total_revenew,
          id,
          companyId,
        } = current_location;

        is_today_last_day() &&
          update_total_contats_promises.push(
            update_location_in_db({
              data: {
                total_contacts: data.total_contacts,
                companyId: companyId,
                id: id,
              },
            })
          );

        location_with_contacts.push({
          name,
          firstName,
          lastName,
          total_contacts,
          total_revenew,
          id,
          new_contacts: data.total_contacts - total_contacts,
        });
      }
    });

    transactions_setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        let total_amount;
        let filtered_transactions;
        let current_location = location_with_contacts.find((loc) => {
          return loc.id === data.location_id;
        });

        data.transactions.length
          ? (filtered_transactions = data.transactions?.filter(
              (ts) =>
                ts.status === "succeeded" && ts.paymentProviderType === "stripe"
            ))
          : null;

        data.transactions.length
          ? (total_amount = filtered_transactions?.reduce(
              (acc, cv, array) => acc.amount + cv.amount
            ))
          : null;

        location_with_all_fields.push({
          ...current_location,
          new_revenew: total_amount ? total_amount : 0,
        });
      }
    });

    is_today_last_day() &&
      (await Promise.allSettled(update_total_contats_promises));

    response
      .status(200)
      .json({ message: "Success", data: location_with_all_fields });
  } catch (error) {
    next(create_error(401, error.stack));
  }
};

module.exports = get_locations_data;
