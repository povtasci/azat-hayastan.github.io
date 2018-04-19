module.exports = {
  db_paths: {
    subscription_based_signups: 'subscription-based-signups',
  },
  result: { success: 'success', failure: 'failure' },
  is_armenian_phone_number: phone_number => /^(?:\+|00)374[0-9]{8}$/.test(phone_number),
};
