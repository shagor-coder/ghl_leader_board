const express = require("express");
const check_request_domain = require("../middlewares/check-domain");
const get_all_locations = require("../middlewares/get-all-locations");
const add_all_locations = require("../controller/add-all-locations");
const get_api_from_ghl = require("../middlewares/get-api-from-hl");

const _Router = express.Router();

_Router.post(
  "/auth/agency",
  check_request_domain,
  get_api_from_ghl,
  get_all_locations,
  add_all_locations
);

_Router.get("/locations/data", check_request_domain);

module.exports = _Router;
