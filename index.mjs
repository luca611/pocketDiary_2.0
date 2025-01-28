// pkgs imports
import express, { request } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';

// local imports
import { DEFAULT_PORT, DEFAULT_SESSION_DURATION, DEFAULT_SESSION_SECRET } from './utils/vars.mjs';
import { sendError, sendSuccess } from './utils/returns.mjs';
import { getAvailableRoutes } from './utils/serverUtils.mjs';
import { connectToDb, closeDbConnection } from './db/dbClinet.mjs';
import { generateKey } from './security/encryption.mjs';
import { register } from './controllers/user.mjs';


dotenv.config();

let client;
/*
    Port setup

    Optional changes:
    -> PORT: must be placed in .env file, default is 3000
*/
const PORT = process.env.PORT || DEFAULT_PORT;

const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE || DEFAULT_SESSION_DURATION;
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;

/*
    -------------------------------------------------------------------------------------------
    Express app setup
*/
const app = express();

/*
    session middleware
    Must change:
    -> secret: must be placed in .env file and must be strong

    Optional changes:
    -> cookie.secure: must be false if not using HTTPS
    -> cookie.maxAge: session duration in milliseconds (def 1 week) 
*/
app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: COOKIE_MAX_AGE,
        secure: false,
    }
}));

/*
    Middleware to parse JSON
*/
app.use(express.json({
    strict: true,
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            sendError(res, 'Invalid JSON');
        }
    }
}));


/* 
    Middleware to handle CORS
    Must change:
    -> origin: must be placed in .env file, default is *

    Optional changes:
    -> methods: allowed HTTP methods if you want more than common ones
*/
app.use(cors(
    {
        origin: process.env.ALLOWD_ORIGINS || "*",
        methods: "GET,POST,DELETE,PATCH",
        allowedHeaders: ["Content-Type", "Authorization"]
    }
));

/*
    -------------------------------------------------------------------------------------------
*/

/*
    Routes
*/
app.get('/getKey', (req, res) => {
    sendSuccess(res, generateKey());
});

app.post('/register', register);

app.get('/', (req, res) => {
    const availableRoutes = getAvailableRoutes(app);
    sendSuccess(res, availableRoutes);
});



app.listen(PORT, () => {
    console.log('Server is running at http://localhost:' + PORT);
});