const check_request_domain = (request, response, next) => {
  try {
    const request_domain = request.hostname || "";

    if (request_domain !== null) return next();
  } catch (error) {
    response.status(500).json({ message: "Something went wrong!" });
  }
};

module.exports = check_request_domain;
