// import 'dotenv/config';
// import http from 'http';
// import app from './app.js';
// import { connectDB } from './config/db.js';
// import { initSockets } from './sockets/index.js';

// const port = Number(process.env.PORT || 8000);
// await connectDB();
// const server = http.createServer(app);
// initSockets(server);
// server.listen(port, () => console.log(`Kabadiwala API running on http://localhost:${port}`));


import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSockets } from "./sockets/index.js";

const port = Number(process.env.PORT || 8000);

await connectDB();

const server = http.createServer(app);

initSockets(server);

server.listen(port, () => {
    console.log(`Kabadiwala API running on http://localhost:${port}`);
});