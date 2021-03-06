import * as url from "url";
import * as querystring from "querystring";
import * as express from "express";
import { v4 as uuidv4 } from "uuid";
import { json } from "body-parser";
import { create as createOAuth2, OAuthClient } from "simple-oauth2";

const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const OAUTH_AUTH_URL = process.env.OAUTH_AUTH_URL;
const OAUTH_REDIRECT_URL = process.env.OAUTH_REDIRECT_URL;
const OAUTH_SCOPE = process.env.OAUTH_SCOPE;

export interface AuthServerResponseHandler {
  (err: Error, token: string): void;
}

export class AuthServer {
  app: express.Express;
  oauth2: OAuthClient;
  private handlers: { [key: string]: AuthServerResponseHandler } = {};

  constructor() {
    this.app = express();

    if (OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET) {
      const credentials = {
        client: {
          id: OAUTH_CLIENT_ID,
          secret: OAUTH_CLIENT_SECRET
        },
        auth: {
          tokenHost: OAUTH_AUTH_URL
        }
      };

      this.oauth2 = createOAuth2(credentials);
    }
  }

  start(port: number) {
    this.app.listen(port, (err: Error) => {
      if (err) {
        console.log(`failed to start listening to ${port}, error ${err}`);
      } else {
        console.log(`listening to ${port}`);
      }
    });
    this.app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        let state = req.query.state;
        let code = req.query.code;
        let handler = this.handlers[state];
        if (typeof handler == "function") {
          delete this.handlers[state];
          const tokenConfig = {
            code: code,
            redirect_uri: OAUTH_REDIRECT_URL
          };

          this.oauth2.authorizationCode.getToken(
            tokenConfig,
            (error, result) => {
              if (error) {
                return handler(error, null);
              }

              const access = this.oauth2.accessToken.create(result);
              handler(null, result.access_token);
              res.send(
                "Authorization processed, you can now close the window."
              );
            }
          );
        } else {
          console.log(Object.keys(this.handlers));
          res.send(`Handler not found for state ${state}`);
        }
      }
    );
  }

  getRedirectUrl(): string {
    if (!this.oauth2) throw new Error("Authorization is not enabled.");
    let state = uuidv4();
    return this.oauth2.authorizationCode.authorizeURL({
      redirect_uri: OAUTH_REDIRECT_URL,
      scope: OAUTH_SCOPE,
      state: state
    });
  }

  async waitForToken(redirectUrl: string): Promise<string> {
    let qs = querystring.parse(url.parse(redirectUrl).query.toString());
    let state = qs.state as string;
    return new Promise<string>((resolve, reject) => {
      this.handlers[state] = (err, token) => {
        if (err) return reject(err);
        resolve(token);
      };
    });
  }
}

export const sharedServer = new AuthServer();
