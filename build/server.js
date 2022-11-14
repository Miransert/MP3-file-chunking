"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const mongodb_1 = require("mongodb");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
// Creates chunking bucket and establishes connection to the mongo database
let bucket;
const mongoURI = process.env.DB_URL;
const client = new mongodb_1.MongoClient(mongoURI);
console.log(mongoURI);
client
    .connect()
    .then((co) => {
    const db = co.db('songs');
    bucket = new mongodb_1.GridFSBucket(db);
    // Immediately uploads the song all_my_love.mp3 to the database with the name all_my_love.mp3 with chunks of 10000 bits.
    // Could be less or more depending on need
    // Maybe set name to be equal to id?
    fs_1.default.createReadStream('./html/Music/all_my_love.mp3').pipe(bucket.openUploadStream('all_my_love.mp3', {
        chunkSizeBytes: 10000,
    }));
})
    .catch((err) => {
    console.error(err);
});
// Socket.IO streaming implementation
// Client connected to socket server
io.on('connect', (socket) => {
    console.log('Client connected to socket');
    // Client disconnected from socket server
    socket.on('disconnect', () => {
        console.log('Client disconnected from socket');
    });
    // Client sent event with type play and thus, we begin streaming song from database and "emitting" or sending it in chunks of data.
    // Song can be found by specific name or id
    socket.on('play', () => {
        bucket.openDownloadStreamByName('all_my_love.mp3').on('data', (chunk) => {
            console.log(chunk);
            socket.emit('audio-chunk', chunk);
        });
    });
});
// HTTP streaming implementation. Sasme principle, except using the pipe function.
app.get('/play', (req, res) => {
    bucket.openDownloadStreamByName('all_my_love.mp3').pipe(res);
});
// Maybe we should just make an endpoint here that mediq acquisition calls
app.post('/song', (req, res) => {
    // Need to figure out how to pipe data from req.body into the gridfs bucket
    bucket.openUploadStream(req.body.name, { chunkSizeBytes: 10000 });
});
// Opens the socket server and HTTP server for requests
server.listen(802, () => {
    console.log('Initialized server');
});
//# sourceMappingURL=server.js.map