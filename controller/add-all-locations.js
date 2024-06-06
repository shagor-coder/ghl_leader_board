const { db } = require("../firebase/app");
const create_error = require("../helpers/create-error");

const add_all_locations = async (request, response, next) => {
  try {
    const locations = request.locations || [];
    const { access_token, refresh_token, expires_in, companyId, userId } =
      request.api_data;

    if (!locations.length) return next(create_error(404, "No locations found"));

    const doc_ref_agency = db.collection("agency").doc();
    const doc_ref_locations = db.collection("locations").doc();

    await doc_ref_agency.set({
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: expires_in,
      companyId: companyId,
      userId: userId,
    });

    let promises = [];

    locations.forEach((location) => {
      const promise = doc_ref_locations.set({
        location_id: location.id,
        name: location.name,
        email: location.email,
        firstName: location.firstName,
        lastName: location.lastName,
      });

      promises.push(promise);
    });

    await Promise.allSettled(promises);

    response.status(201).json({
      messgae: "All locations has been added",
    });
  } catch (error) {
    next(create_error(500, error.message));
  }
};

module.exports = add_all_locations;
