const { Verifier } = require("@pact-foundation/pact");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const { server, importData, userRepository } = require("../src/provider.js");
const path = require("path");
const PORT = 8081;

server.listen(PORT, () => {
    console.log(`User Service listening on http://localhost:${PORT}`)
});

// Verify that the provider meets all consumer expectations
describe("Pact Verification", () => {
    it("validates the expectations of Consumer Service", () => {
        let token = "INVALID TOKEN";

        let opts = {
            provider: "Provider Service",
            logLevel: "DEBUG",
            providerBaseUrl: "http://localhost:8081",

            requestFilter: (req, res, next) => {
                console.log(
                    "Middleware invoked before provider API - injecting Authorization token"
                );
                req.headers["authorization"] = `Bearer ${token}`;
                next()
            },

            stateHandlers: {
                "Has a user with ID 1": () => {
                    token = "1234";
                    importData();
                    return Promise.resolve(`Users added to the db`)
                },
                "Has no users": () => {
                    token = "1234";
                    importData();
                    userRepository.clear();
                    return Promise.resolve('Users removed from db')
                },
                "is not authenticated": () => {
                    token = "";
                    return Promise.resolve(`Invalid bearer token generated`)
                },
            },

            // Fetch pacts from broker
            pactBrokerUrl: "http://localhost",

            // Fetch from broker with given tags
            consumerVersionTag: ["dev"],

            // Tag provider with given tags
            providerVersionTag: ["dev"],


            publishVerificationResult: true,
            providerVersion: "1.1.0",
        };

        return new Verifier().verifyProvider(opts).then(function () {
            console.log("Pacts successfully verified!");
        });
    })
});
