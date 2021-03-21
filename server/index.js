// const { ApolloServer } = require("apollo-server-express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
// const express = require("express");
const { MONGODB } = require("./config");
const resolvers = require("./graphql/Resolvers");
const typeDefs = require("./graphql/typeDefs");
// const cloudinary = require("cloudinary").v2;
// const server = new ApolloServer({
//   cors: true,
//   typeDefs,
//   resolvers,

//   context: ({ req }) => ({ req }),
// });

// const port = process.env.PORT || 5000;

// server
//   .listen({ port })
//   .then(() => console.log("Server started"))
//   .then(() => {
//     mongoose
//       .connect(MONGODB, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useFindAndModify: false,
//         useCreateIndex: true,
//       })
//       .then(() => console.log("DB Connected"));
//   });
const express = require("express");
const { ApolloServer, ApolloError } = require("apollo-server-express");
const { ApolloServerPluginInlineTrace } = require("apollo-server-core");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
// const typeDefs = require("./graphql/schema");
// const resolvers = require("./graphql/resolvers");
const fs = require("fs");
const https = require("https");
const http = require("http");
// import { Mongoose } from "mongoose"

const config = {
  ssl: false,
  port: 5000,
};

// const environment = process.env.NODE_ENV || "production";
// const config = configurations[environment];

const apollo = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // console.log(req)
    return { req };
  },
  tracing: true,
  plugins: [ApolloServerPluginInlineTrace()],
});

const app = express();

apollo.applyMiddleware({
  app,
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: "X-Requested-With, Content-Type, Authorization",
  })
);
// Create the HTTPS or HTTP server, per configuration
// let server;
// if (config.ssl) {
//   // Assumes certificates are in a .ssl folder off of the package root. Make sure
//   // these files are secured.
//   server = https.createServer(
//     {
//       key: fs.readFileSync(`./ssl/_.yummymaker.com_private_key.key`),
//       cert: fs.readFileSync(`./ssl/yummymaker.com_ssl_certificate.cer`),
//     },
//     app
//   );
// } else {
//   server = http.createServer(app);
// }

mongoose
  .connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

app.listen({ port: config.port });
console.log("Connected to server");
