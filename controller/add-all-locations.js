const add_data_in_db = require("../helpers/add-data-in-db");
const check_in_db = require("../helpers/check-in-db");
const create_error = require("../helpers/create-error");
const { create_expire_date } = require("../helpers/create-expire-date");
const { get_location_api_by_agency } = require("../helpers/get-location-api");
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

    let promises = [];
    let updated_locations = [];

    locations.forEach((location) => {
      const promise = get_location_api_by_agency({
        access_token: access_token,
        company_id: companyId,
        location_id: location.id,
      });
      promises.push(promise);
    });

    const setteled = await Promise.allSettled(promises);

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

    let location_promises = [];
    updated_locations?.forEach((location) => {
      const promise = add_data_in_db({
        collection_name: "locations",
        data: {
          ...location,
          expires_in: create_expire_date(expires_in),
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
