module.exports = {
  db_paths: {
    subscription_based_signups: 'subscription-based-signups',
  },
  result: { success: 'success', failure: 'failure' },
  is_phone_number: phone_number => /^[\d+\-() ]+$/.test(phone_number),
};
