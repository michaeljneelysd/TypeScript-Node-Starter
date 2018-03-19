import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as morgan from "morgan";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as passport from "passport";
import * as expressValidator from "express-validator";
import * as bluebird from "bluebird";
import * as sgMail from "@sendgrid/mail";
import * as acl from "./config/acl";
import { AccessControl } from "accesscontrol";
import { ConnectorServer } from "corenlp";
import { shim } from "promise.prototype.finally";

/* tslint:disable: no-console */

// Add 'finally' to promise chain
shim();

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" });

// Load Logging
import { logger, Stream } from "./utils/logger";
import { asyncMiddleware } from "./utils/asyncMiddleware";

// Morgan Stream
const stream = new Stream();

// Initialize Mongo Session Store
const MongoStore = mongo(session);

// Routes
import * as homeController from "./controllers/home";
import parseAPI from "./controllers/parse";
import summaryAPI from "./controllers/summarize";
import corpusAPI from "./controllers/corpus";
import userAPI from "./controllers/user";
import contactAPI from "./controllers/contact";

// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to CoreNLP Server
export const connector = new ConnectorServer({ dsn: process.env.CoreNLPAddress});

// Enforce Access Control
export const accessControl = new AccessControl(acl.grants);

// Mail Service
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
console.log("connected to mongodb"); },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(morgan("tiny", { stream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.use(corpusAPI);
app.use(userAPI);
app.use(contactAPI);
app.use(summaryAPI);
app.use(parseAPI);

module.exports = app;
