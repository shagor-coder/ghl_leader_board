const crypto = require("crypto");

const create_hash = (string) => {
  try {
    const hash = crypto.hash(string, 10);
    return hash;
  } catch (error) {
    throw new Error(error.message);
  }
};

const read_hash = async (string) => {
  try {
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = create_read_hash;
