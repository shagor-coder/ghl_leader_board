const { db } = require("../firebase/app");
const create_error = require("../helpers/create-error");
const {
  check_expire_date,
  create_expire_date,
} = require("../helpers/create-expire-date");
const formal_sa_transactions = require("../helpers/format-transactions");
const get_agency_api_by_refresh = require("../helpers/get-agency_api_by_refresh");
const get_contacts_for_sa = require("../helpers/get-contacts-for-sa");
const { get_location_api_by_agency } = require("../helpers/get-location-api");
const {
  get_start_time_of_month,
  is_today_last_day,
} = require("../helpers/get-start-time-of-month");
const get_transactions_for_sa = require("../helpers/get-transactions-for-sa");
const update_data_in_db = require("../helpers/update-data-in-db");
const update_location_in_db = require("../helpers/update_location_in_db");

const update_locations_api = async ({
  refresh_token,
  expires_in,
  locations = [],
}) => {
  try {
    const expired = check_expire_date(expires_in);

    if (!expired) return locations;
    const api_data = await get_agency_api_by_refresh(refresh_token);
    const {
      access_token,
      refresh_token: new_refresh_token,
      expires_in: new_expires_in,
      companyId,
    } = api_data;

    await update_data_in_db({
      collection_name: "agencys",
      data: {
        access_token,
        refresh_token: new_refresh_token,
        expires_in: create_expire_date(new_expires_in),
        companyId: companyId,
      },
    });

    let location_api_promises = [];
    let location_update_promises = [];
    let updated_locations = [];

    locations.forEach((loc) => {
      const promise = get_location_api_by_agency({
        access_token,
        company_id: companyId,
        location_id: loc.id,
      });
      location_api_promises.push(promise);
    });

    const location_api_settled = await Promise.allSettled(
      location_api_promises
    );

    location_api_settled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        const {
          access_token: location_access_token,
          refresh_token: location_refresh_token,
          expires_in: location_expires_in,
          locationId,
        } = data;
        const promise = update_location_in_db({
          access_token: location_access_token,
          refresh_token: location_refresh_token,
          expires_in: create_expire_date(location_expires_in),
          id: locationId,
        });

        location_update_promises.push(promise);
      }
    });

    const location_settled = await Promise.allSettled(location_update_promises);

    location_settled.forEach((result) => {
      if (result.status === "fulfilled") {
        updated_locations.push(result.value);
      }
    });

    return updated_locations;
  } catch (error) {
    throw new Error(error);
  }
};

const get_locations_data = async (request, response, next) => {
  try {
    const companyId = request.query.companyId;
    if (!companyId)
      return next(create_error(401, "Please provide a companyId"));

    let locations = [];
    const last_day = is_today_last_day();

    const locations_ref = db.collection("locations");
    const agency_ref = db.collection("agencys");

    const agecy_snapshot = await agency_ref
      .where("companyId", "==", companyId.trim())
      .get();

    if (agecy_snapshot.empty)
      return response.status(404).json({ message: "No Company Found!!" });

    const { access_token, refresh_token, expires_in } =
      agecy_snapshot.docs[0].data();

    const query_snapshots = await locations_ref
      .where("companyId", "==", companyId.trim())
      .get();

    if (query_snapshots.empty)
      return response
        .status(404)
        .json({ message: "No Location Found For This Company" });

    query_snapshots.forEach((qs) => {
      locations.push(qs.data());
    });

    locations = await update_locations_api({
      access_token,
      refresh_token,
      expires_in,
      locations,
    });

    let contact_promises = [];
    let transaction_promises = [];

    locations.forEach((location) => {
      const transaction_promise = get_transactions_for_sa({
        access_token: location.access_token,
        location_id: location.id,
      });
      const contact_promise = get_contacts_for_sa({
        access_token: location.access_token,
        location_id: location.id,
        startAfter: get_start_time_of_month(),
      });
      contact_promises.push(contact_promise);
      transaction_promises.push(transaction_promise);
    });

    const transactions_setteled = await Promise.allSettled(
      transaction_promises
    );
    const contacts_setteled = await Promise.allSettled(contact_promises);

    let location_with_contacts = [];
    let location_with_all_fields = [];
    let update_location_promises = [];

    contacts_setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        let current_location = locations.find(
          (loc) => loc.id === data.location_id
        );
        const { name, firstName, lastName, total_contacts, total_revenew, id } =
          current_location;
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
        let current_location = location_with_contacts.find((loc) => {
          return loc.id === data.location_id;
        });

        const total_amount = formal_sa_transactions(data.transactions);

        let amount;

        if (total_amount === null || total_amount === undefined) {
          amount = 0;
        } else {
          amount = total_amount;
        }

        location_with_all_fields.push({
          ...current_location,
          new_revenew: amount - current_location.total_revenew,
        });

        last_day &&
          update_location_promises.push(
            update_location_in_db({
              id: current_location.id,
              total_revenew: amount,
              total_contacts:
                current_location.new_contacts + current_location.total_contacts,
            })
          );
      }
    });

    last_day && (await Promise.allSettled(update_location_promises));

    response
      .status(200)
      .json({ message: "Success", data: location_with_all_fields });
  } catch (error) {
    next(create_error(401, error.stack));
  }
};

module.exports = get_locations_data;
