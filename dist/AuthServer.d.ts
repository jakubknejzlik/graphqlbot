/// <reference types="express" />
import * as express from "express";
import { OAuthClient } from "simple-oauth2";
export interface AuthServerResponseHandler {
    (err: Error, token: string): void;
}
export declare class AuthServer {
    app: express.Express;
    oauth2: OAuthClient;
    private handlers;
    constructor();
    start(port: number): void;
    getRedirectUrl(): string;
    waitForToken(redirectUrl: string): Promise<string>;
}
export declare const sharedServer: AuthServer;
