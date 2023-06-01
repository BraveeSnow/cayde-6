import axios from "axios";
import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { APIUser } from "@discordjs/core";
import { CaydeClient } from "@cayde/common/client";
import { log } from "@cayde/common/log";

const HOME_URL = process.env.HOME_URL || "http://localhost:5173";

const TOKEN_URL = "https://discord.com/api/v10/oauth2";
const REDIRECT_URL = "http://localhost/api/oauth/discord";

export function createServer(client: CaydeClient) {
  const server: Express = express();
  const port: number = Number.parseInt(process.env.PORT || "3000");

  server.get("/api/oauth/discord", async (req, res) => {
    const code = req.query.code;

    try {
      let secret: string;
      const tokens = await axios.post(
        `${TOKEN_URL}/token`,
        {
          client_id: (await client.api.users.getCurrent()).id,
          client_secret: process.env.DISCORD_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URL,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const userInfo: APIUser = (
        await axios.get(`${TOKEN_URL}/@me`, {
          headers: {
            Authorization: `Bearer ${tokens.data.access_token}`,
          },
        })
      ).data.user;

      if (!(await client.db.exists(`SELECT * FROM oauth WHERE id = '${userInfo.id}'`))) {
        secret = uuid();

        while (await client.db.exists(`SELECT * FROM oauth WHERE secret = '${secret}'`)) {
          secret = uuid();
        }

        client.db.insertValues("oauth", ["id", "secret"], [userInfo.id, secret]);
      } else {
        secret = (await client.db.query(`SELECT * FROM oauth WHERE id = '${userInfo.id}'`)).secret;
      }

      console.log("Finish");
      return res
        .cookie(
          "auth",
          jwt.sign(
            {
              id: userInfo.id,
            },
            secret
          )
        )
        .redirect(HOME_URL);
    } catch {
      return res.redirect(HOME_URL);
    }
  });

  server.get("/api/oauth/anilist", (req: Request, res: Response) => {
    if (!req.query.code) {
      return res.sendStatus(400);
    }

    // TODO: handle this stuff through the front-end
    const token: string = req.query.code.toString();
  });

  server.listen(port, () => {
    log(`Server listening on port ${port}`);
  });
}
