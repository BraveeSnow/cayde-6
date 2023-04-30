import path from "path";
import dotenv from "dotenv";
import {
    APIInteraction,
    ActivityType,
    GatewayDispatchEvents,
    GatewayIntentBits,
    InteractionType,
    PresenceUpdateStatus,
    WithIntrinsicProps,
} from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";

import { CaydeClient } from "@cayde/common/client";
import { log } from "@cayde/common/log";

async function startCayde(token: string): Promise<void> {
    const rest = new REST({
        version: "10",
    }).setToken(token);
    const gateway = new WebSocketManager({
        token: token,
        intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
        rest,
    });

    const cayde = new CaydeClient({ rest: rest, ws: gateway });
    cayde.loadCommands(path.join(process.cwd(), "./dist/commands"));

    cayde.on(GatewayDispatchEvents.InteractionCreate, async (props: WithIntrinsicProps<APIInteraction>) => {
        if (props.data.type !== InteractionType.ApplicationCommand) {
            return;
        }

        const cmd = cayde.getCommand(props.data.data.name);
        if (!cmd) {
            return;
        }

        await cmd.exec(props.api, props.data);
    });
    cayde.on(GatewayDispatchEvents.Ready, () => {
        log("Cayde-6 is ready");
    });

    await gateway.connect();
    cayde.ws.getShardIds().then((ids: number[]) => {
        ids.forEach((shardId: number) => {
            cayde.updatePresence(shardId, {
                status: PresenceUpdateStatus.Online,
                activities: [
                    {
                        name: "the stars fly by...",
                        type: ActivityType.Watching,
                    },
                ],
                since: null,
                afk: false,
            });
        });
    });
    cayde;
}

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (token) {
    startCayde(token);
} else {
    log("Environment variable DISCORD_TOKEN is undefined");
}
