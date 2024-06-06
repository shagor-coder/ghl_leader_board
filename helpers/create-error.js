const create_error = (code, message) => {
  const err = new Error();
  err.status = code;
  err.message = message;

  return err;
};

module.exports = create_error;
