module.exports = {
  db_paths: {
    all_phone_numbers_ref_path: 'all-phone-numbers',
    subscription_based_signups: 'subscription_based_signups',
  },
  result: { success: 'success', failure: 'failure' },
  is_phone_number: phone_number => /^[\d+\-() ]+$/.test(phone_number),
};
