const { STRIPE_KEY } = require("../../config");
const Stripe = require("stripe");
const { ApolloError } = require("@apollo/client");
const User = require("../../models/User");
const checkAuth = require("../../utils/checkAuth");
const { default: fetch } = require("node-fetch");

// Create new instance of Stripe
const stripe = Stripe(STRIPE_KEY);

module.exports = {
  Query: {
    verifyStripe: async (_, __, context) => {
      const username = checkAuth(context);

      try {
        // Retreive Info about the user
        const user = await User.findById(username.id);

        // Retrieve Info about the user stripe Account
        let account = await stripe.accounts.retrieve(user.stripe_id);
        // Verify Info about the user stripe account
        if (account && account.details_submitted) {
          if (account.charges_enabled) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } catch (error) {
        throw new ApolloError("Something Went Wrong", { errors: error });
      }
    },
  },

  Mutation: {
    addConnectedAccount: async (_, __, context) => {
      const authUser = checkAuth(context);

      // Create new Express Account
      try {
        const account = await stripe.accounts.create({
          type: "express",
          country: "US",
          business_type: "individual",
          email: authUser.email,
          individual: {
            first_name: authUser.first_name,
            last_name: authUser.last_name,
            email: authUser.email,
          },
          settings: {
            payouts: {
              schedule: { delay_days: 7, interval: "daily" },
            },
          },
        });

        // Create new Links for frontend
        const accountLinks = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: "http://localhost:3000/chef-dashboard?status=error",
          return_url: "http://localhost:3000/chef-dashboard?status=complete",
          type: "account_onboarding",
        });

        try {
          await User.findByIdAndUpdate(authUser.id, {
            $set: { stripe_id: account.id },
          });
          console.log(accountLinks.url);
          return accountLinks.url;
        } catch (err) {
          throw new ApolloError(err);
        }
      } catch (error) {
        throw new ApolloError("Something Went wrong", { error });
      }
    },
  },
};
