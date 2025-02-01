// pkgs imports
import express, { request } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// local imports
import { DEFAULT_PORT, DEFAULT_SESSION_DURATION, DEFAULT_SESSION_SECRET } from './utils/vars.mjs';
import { sendError, sendSuccess } from './utils/returns.mjs';
import { getAvailableRoutes, keepAlive } from './utils/serverUtils.mjs';
import { generateKey } from './security/encryption.mjs';
import { register, logout, login, updatePassword, updateTheme, updateName, updateCustomTheme, getTheme, getName, getCustomTheme, deleteUser } from './controllers/user.mjs';
import { addNote, deleteNote, getDayNotes, getNoteById, updateNote } from './controllers/notes.mjs';
import { connectToDb, executeQuery } from './db/dbClinet.mjs';


dotenv.config();

/*
    Port setup

    Optional changes:
    -> PORT: must be placed in .env file, default is 3000
*/
const PORT = process.env.PORT || DEFAULT_PORT;

const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE || DEFAULT_SESSION_DURATION;
const SESSION_SECRET = process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*
    -------------------------------------------------------------------------------------------
    Express app setup
*/
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

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
        secure: true,
        httpOnly: true,
        sameSite: "lax"
    }
}));
/*
    Middleware to parse JSON and handle invalid JSON before sending it to the routes
*/
app.use((req, res, next) => {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });

    req.on("end", () => {
        if (data) {
            try {
                req.body = JSON.parse(data);
                next();
            } catch {
                req.body = null;
                console.warn("▶ Received invalid JSON from " + req.ip);
                sendError(res, "Invalid JSON");
            }
        } else {
            req.body = null;
            next();
        }
    });
});


/* 
    Middleware to handle CORS
    Must change:
    -> origin: must be placed in .env file, default is *

    Optional changes:
    -> methods: allowed HTTP methods if you want more than common ones
*/
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || "*",
        methods: "GET,POST,DELETE,PUT",
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
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

app.get('/isLogged', (req, res) => {
    if (req.session.logged) {
        sendSuccess(res, true);
    } else {
        sendError(res, false);
    }
});

app.get('/pingDB', async (req, res) => {
    try {
        let conn = await connectToDb();
        executeQuery(conn, 'SELECT 1')
        closeConnection(conn);
    } catch (error) {
    }
});



/*
    User routes
*/
app.post('/register', register);
app.post('/login', login);

app.put('/updatePassword', updatePassword);
app.put('/updateTheme', updateTheme);
app.put('/updateName', updateName);
app.put('/updateCustomTheme', updateCustomTheme);

app.get('/getTheme', getTheme);
app.get('/getName', getName);
app.get('/getCustomTheme', getCustomTheme);

app.delete('/logout', logout);
app.delete('/deleteAccount', deleteUser);

/*
    Note routes
*/

app.post('/addNote', addNote);
app.post('/getDayNotes', getDayNotes);

app.get('/getNoteById', getNoteById);

app.put('/updateNote', updateNote);

app.delete('/deleteNote', deleteNote);


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
    const availableRoutes = getAvailableRoutes(app);
    sendSuccess(res, availableRoutes);
});


app.listen(PORT, () => {
    console.log('Server is running at http://localhost:' + PORT);
    keepAlive();
});