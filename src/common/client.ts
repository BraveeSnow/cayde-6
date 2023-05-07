import { readdirSync } from "fs";
import path from "path";
import url from "url";

import {
    API,
    APIChatInputApplicationCommandInteraction,
    Client,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "@discordjs/core";

import { log, Severity } from "@cayde/common/log";

export interface Command {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody;
    exec(api: API, int: APIChatInputApplicationCommandInteraction): Promise<void>;
}

export class CaydeClient extends Client {
    private commandMap: Map<string, Command> = new Map();

    getCommand(name: string): Command | undefined {
        return this.commandMap.get(name);
    }

    loadCommands(commandPath: string): void {
        for (const entry of readdirSync(commandPath, { withFileTypes: true })) {
            const entryPath: string = path.join(commandPath, entry.name);

            if (entry.isDirectory()) {
                this.loadCommands(entryPath);
                continue;
            }

            if (!entry.name.endsWith(".js")) {
                log(`Entry ${entryPath} is not a command or directory, skipping...`, Severity.WARN);
                continue;
            }

            log(`Loading command from ${entryPath}`);
            import(url.pathToFileURL(entryPath).toString())
                .then((imp) => imp.default.default)
                .then((cmd: Command) => {
                    if (this.commandMap.has(cmd.data.name)) {
                        log(`Command with name ${cmd.data.name} already exists, consider renaming`, Severity.WARN);
                    } else {
                        this.commandMap.set(cmd.data.name.toLowerCase(), cmd);
                        this.api.applicationCommands.createGuildCommand(
                            "694828817457479731",
                            "799141153260961802",
                            cmd.data
                        );
                    }
                });
        }
    }
}
