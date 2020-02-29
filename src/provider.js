const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Repository = require("./repository");

const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
server.use((req, res, next) => {
    res.header("Content-Type", "application/json; charset=utf-8");
    next()
});

server.use((req, res, next) => {
    const token = req.headers["authorization"] || "";

    if (token !== "Bearer 1234") {
        res.sendStatus(401).send()
    } else {
        next()
    }
});

const userRepository = new Repository();

// Load default data into a repository
const importData = () => {
    const data = require("../resources/userData.json");
    data.reduce((a, v) => {
        v.id = a + 1;
        userRepository.insert(v);
        return a + 1;
    }, 0)
};

// List all users with 'available' eligibility
const availableUsers = () => {
    return userRepository.fetchAll().filter(a => {
        return a.eligibility.available
    })
};

// Get all users
server.get("/users", (req, res) => {
    res.json(userRepository.fetchAll())
});

// Get all active users
server.get("/users/available", (req, res) => {
    res.json(availableUsers())
});

// Find an user by ID
server.get("/users/:id", (req, res) => {
    const response = userRepository.getById(req.params.id);
    if (response) {
        res.end(JSON.stringify(response))
    } else {
        res.writeHead(404);
        res.end()
    }
});

// Register a new user for the service
server.post("/users", (req, res) => {
    const user = req.body;

    // Really basic validation
    if (!user || !user.first_name) {
        res.writeHead(400);
        res.end();

        return
    }

    user.id = userRepository.fetchAll().length;
    userRepository.insert(user);

    res.json(user)
});

module.exports = {
    server,
    importData,
    userRepository,
};
