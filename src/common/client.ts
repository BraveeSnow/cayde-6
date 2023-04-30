import { Dirent, readdirSync } from "fs";
import path from "path";
import url from "url";

import { SlashCommandBuilder } from "@discordjs/builders";
import { API, APIInteraction, Client } from "@discordjs/core";

import { log, Severity } from "@cayde/common/log";

export interface Command {
    data: SlashCommandBuilder;
    exec(api: API, data: APIInteraction): Promise<void>;
}

export class CaydeClient extends Client {
    private commandMap: Map<string, Command> = new Map();

    getCommand(name: string): Command | undefined {
        return this.commandMap.get(name);
    }

    loadCommands(commandPath: string): void {
        const entries: Dirent[] = readdirSync(commandPath, { withFileTypes: true });

        for (const entry of entries) {
            const entryPath: string = path.join(commandPath, entry.name);

            if (entry.isDirectory()) {
                this.loadCommands(entryPath);
                continue;
            }

            if (!entry.name.endsWith(".js")) {
                log(`Entry ${entryPath} is not a command or directory, skipping...`, Severity.WARN);
                continue;
            }

            const commandName: string = entry.name.split(".")[0];

            if (this.commandMap.has(commandName)) {
                log(`Command with name ${commandName} already exists, consider renaming`, Severity.WARN);
                continue;
            }

            log(`Loading command from ${entryPath}`);
            import(url.pathToFileURL(entryPath).toString())
                .then((imp) => imp.default.default)
                .then((cmd: Command) => {
                    this.commandMap.set(cmd.data.name.toLowerCase(), cmd);
                });
        }
    }
}
