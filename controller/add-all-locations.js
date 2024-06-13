const add_data_in_db = require("../helpers/add-data-in-db");
const check_in_db = require("../helpers/check-in-db");
const create_error = require("../helpers/create-error");
const { create_expire_date } = require("../helpers/create-expire-date");
const formal_sa_transactions = require("../helpers/format-transactions");
const get_contacts_for_sa = require("../helpers/get-contacts-for-sa");
const { get_location_api_by_agency } = require("../helpers/get-location-api");
const get_transactions_for_sa = require("../helpers/get-transactions-for-sa");
const update_data_in_db = require("../helpers/update-data-in-db");

const handle_agency_install = async ({
  access_token,
  refresh_token,
  companyId,
  userId,
  expires_in,
}) => {
  try {
    const is_agency_there = await check_in_db({
      collection_name: "agencys",
      field_name: "companyId",
      field_value: companyId,
    });
    is_agency_there.empty
      ? await add_data_in_db({
          collection_name: "agencys",
          data: {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: create_expire_date(expires_in),
            companyId: companyId,
            userId: userId,
          },
        })
      : await update_data_in_db({
          collection_name: "agencys",
          data: {
            access_token: access_token,
            refresh_token: refresh_token,
            expires_in: create_expire_date(expires_in),
            companyId: companyId,
          },
        });
  } catch (error) {
    throw new Error(error);
  }
};

const add_all_locations = async (request, response, next) => {
  try {
    const locations = request.locations || [];
    const { access_token, refresh_token, expires_in, companyId, userId } =
      request.api_data;

    if (!locations.length) return next(create_error(404, "No locations found"));

    await handle_agency_install({
      access_token,
      refresh_token,
      companyId,
      userId,
      expires_in,
    });

    let api_promises = [];
    let updated_locations = [];
    let contact_promises = [];
    let transaction_promises = [];

    locations.forEach((location) => {
      const promise = get_location_api_by_agency({
        access_token: access_token,
        company_id: companyId,
        location_id: location.id,
      });
      api_promises.push(promise);
    });

    const setteled = await Promise.allSettled(api_promises);

    setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        const current_location = locations.find(
          (loc) => loc.id === data.locationId
        );

        const { id, firstName, lastName, name } = current_location;

        updated_locations.push({ id, firstName, lastName, name, ...data });
      }
    });

    updated_locations.forEach((location) => {
      const promise = get_transactions_for_sa({
        access_token: location.access_token,
        location_id: location.id,
      });
      transaction_promises.push(promise);
    });

    updated_locations.forEach((location) => {
      const promise = get_contacts_for_sa({
        access_token: location.access_token,
        location_id: location.id,
      });

      contact_promises.push(promise);
    });

    const transactions_setteled = await Promise.allSettled(
      transaction_promises
    );
    const contacts_setteled = await Promise.allSettled(contact_promises);

    let location_with_contacts = [];
    let location_with_all_fields = [];

    contacts_setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value;
        let current_location = updated_locations.find(
          (loc) => loc.id === data.location_id
        );
        location_with_contacts.push({
          ...current_location,
          total_contacts: data.total_contacts,
        });
      }
    });

    transactions_setteled.forEach((result) => {
      if (result.status === "fulfilled") {
        const data = result.value || [];
        let current_location = location_with_contacts.find(
          (loc) => loc.id === data.location_id
        );

        const total_amount = formal_sa_transactions(data.transactions);

        location_with_all_fields.push({
          ...current_location,
          total_revenew: total_amount ? total_amount : 0,
        });
      }
    });

    let location_promises = [];

    location_with_all_fields?.forEach((location) => {
      const promise = add_data_in_db({
        collection_name: "locations",
        data: {
          ...location,
          expires_in: create_expire_date(expires_in),
          months: [
            { Jan: { total_revenew: 0, total_contacts: 0 } },
            { Feb: { total_revenew: 0, total_contacts: 0 } },
            { Mar: { total_revenew: 0, total_contacts: 0 } },
            { Apr: { total_revenew: 0, total_contacts: 0 } },
            { May: { total_revenew: 0, total_contacts: 0 } },
            { Jun: { total_revenew: 0, total_contacts: 0 } },
            { Jul: { total_revenew: 0, total_contacts: 0 } },
            { Aug: { total_revenew: 0, total_contacts: 0 } },
            { Sep: { total_revenew: 0, total_contacts: 0 } },
            { Oct: { total_revenew: 0, total_contacts: 0 } },
            { Nov: { total_revenew: 0, total_contacts: 0 } },
            { Dec: { total_revenew: 0, total_contacts: 0 } },
          ],
        },
      });

      location_promises.push(promise);
    });

    await Promise.allSettled(location_promises);

    response.status(201).json({
      messgae: "All locations has been added",
    });
  } catch (error) {
    next(create_error(500, error.message));
  }
};

module.exports = add_all_locations;
