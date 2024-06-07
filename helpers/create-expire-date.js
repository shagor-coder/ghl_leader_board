const create_expire_date = (expires_in) => {
  const current_date = new Date();
  const expiration_date = new Date(current_date.getTime() + expires_in * 1000);
  return expiration_date;
};

const check_expire_date = (expires_in) => {
  const expiration_date_obj = new Date(
    expires_in._seconds * 1000 + expires_in._nanoseconds / 1000000
  );
  const current_date = new Date();
  return expiration_date_obj < current_date;
};

module.exports = { create_expire_date, check_expire_date };
