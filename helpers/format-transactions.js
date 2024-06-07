const formal_sa_transactions = (transactions) => {
  let total_amount;
  let filtered_transactions;
  let amounts;

  transactions.length
    ? (filtered_transactions = transactions?.filter(
        (ts) => ts.status === "succeeded" && ts.paymentProviderType === "stripe"
      ))
    : null;

  amounts = filtered_transactions?.map((ft) => ft.amount);

  amounts
    ? (total_amount = amounts?.reduce((acc, cv, array) => {
        if (!cv && !acc) return acc + 0;
        return acc + cv;
      }))
    : null;
  return total_amount;
};

module.exports = formal_sa_transactions;
