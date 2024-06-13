const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const get_start_time_of_month = () => {
  const now = new Date();
  const start_of_month = new Date(now.getFullYear(), now.getMonth(), 1);
  return start_of_month.getTime();
};

const is_today_last_day = () => {
  const today = new Date();
  const next_day = new Date(today);
  next_day.setDate(today.getDate() + 1);

  const month = months[today.getMonth()];
  const is_last_day = next_day.getDate() === 1;
  return { is_last_day, month };
};

module.exports = { get_start_time_of_month, is_today_last_day };
