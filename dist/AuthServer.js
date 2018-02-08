"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const querystring = require("querystring");
const express = require("express");
const uuid_1 = require("uuid");
const simple_oauth2_1 = require("simple-oauth2");
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const OAUTH_AUTH_URL = process.env.OAUTH_AUTH_URL;
const OAUTH_REDIRECT_URL = process.env.OAUTH_REDIRECT_URL;
const OAUTH_SCOPE = process.env.OAUTH_SCOPE;
class AuthServer {
    constructor() {
        this.handlers = {};
        this.app = express();
        const credentials = {
            client: {
                id: OAUTH_CLIENT_ID,
                secret: OAUTH_CLIENT_SECRET
            },
            auth: {
                tokenHost: OAUTH_AUTH_URL
            }
        };
        this.oauth2 = simple_oauth2_1.create(credentials);
    }
    start(port) {
        this.app.listen(port, (err) => {
            if (err) {
                console.log(`failed to start listening to ${port}, error ${err}`);
            }
            else {
                console.log(`listening to ${port}`);
            }
        });
        this.app.use((req, res, next) => {
            let state = req.query.state;
            let token = req.query.code;
            this.handlers[state](token);
            res.send("Authorization processed, you can now close the window.");
        });
    }
    getRedirectUrl() {
        let state = uuid_1.v4();
        return this.oauth2.authorizationCode.authorizeURL({
            redirect_uri: OAUTH_REDIRECT_URL,
            scope: OAUTH_SCOPE,
            state: state
        });
    }
    waitForToken(redirectUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            let qs = querystring.parse(url.parse(redirectUrl).query.toString());
            let state = qs.state;
            return new Promise((resolve, reject) => {
                this.handlers[state] = resolve;
            });
        });
    }
}
exports.AuthServer = AuthServer;
exports.sharedServer = new AuthServer();
//# sourceMappingURL=AuthServer.js.map