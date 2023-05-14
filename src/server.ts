import express, { Express, Request, Response } from "express";
import { CaydeClient } from "@cayde/common/client";
import { log } from "@cayde/common/log";

export function createServer(client: CaydeClient) {
    const server: Express = express();
    const port: number = Number.parseInt(process.env.PORT || "3000");

    server.get("/api/oauth/anilist", (req: Request, res: Response) => {
        if (!req.query.code) {
            return res.sendStatus(400);
        }

        // TODO: handle this stuff through the front-end
        const token: string = req.query.code.toString();
        client.db.insert("anilist", ["id", token]);
        res.send("Successfully logged in with Cayde-6");
    });

    server.listen(port, () => {
        log(`Server listening on port ${port}`);
    });
}
