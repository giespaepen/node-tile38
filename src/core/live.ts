import * as net from "net";
import Parser from "redis-parser";

import { Tile38Config } from "../config";
import { Tile38LiveObjectResult } from "../types";
import { ITile38Logging } from "../util/logging";
import { Tile38Query } from "./query";
import { encodeQueryToRedisCommand } from "./util";

/**
 * establishes an open socket to the Tile38 server for live geofences.
 */
export class LiveGeofence {

    private debug: boolean | undefined;
    private logging: ITile38Logging;
    private socket: net.Socket | undefined;
    private onCloseCallback: () => void;

    constructor(private config: Tile38Config) {
        this.debug = config.debug;
        this.logging = config.logging;
        this.onCloseCallback = () => { /** */ };
    }

    /**
     * opens a socket to the server, submits a command, then continuously processes data that is returned
     * from the Tile38 server
     * @param host
     * @param port
     * @param password
     * @param redisCommmand Command string to send to Tile38
     * @param callback callback method with parameters (err, results)
     */
    public open<T>(query: Tile38Query, callback: (result: Tile38LiveObjectResult<T>, error?: Error) => void): LiveGeofence {
        // Get the data
        const { port, host, password, debug, logging } = this.config;

        // Get the command
        const command = encodeQueryToRedisCommand(query);

        this.logging.debug(`Opening live geofence for command ${query}`);
        const socket = new net.Socket();
        this.socket = socket;

        // Connect socket
        socket.connect(port, host, () => {
            if (password) {
                // authenticate if necessary
                socket.write(`AUTH ${password}\r\n`);
            }
            socket.write(command + "\r\n");
        });

        // On close the socket
        socket.on("close", this.onClose);

        const parser = new Parser({
            returnReply: (rawReply: string) => {
                if (debug) {
                    logging.log(rawReply);
                }
                if (rawReply === "OK") return; // we're not invoking a callback for the 'OK' response that comes first

                let reply = rawReply;
                const firstCharOfReply = rawReply.charAt(0);
                if (firstCharOfReply == "{" || firstCharOfReply == "[") {
                    // this smells like json, so try to parse it
                    try {
                        reply = JSON.parse(rawReply);
                    } catch (err) {
                        // we'll return the reply as-is.
                        logging.warn("Unable to parse server response: " + rawReply);
                    }
                }
                callback(reply as Tile38LiveObjectResult<T>);
            },
            returnError: (error: Error) => {
                logging.error(`Live socket error ${error}`);
                callback(undefined, error);
            },
            returnFatalError: (error: Error) => {
                logging.error(`Live socket fatal error ${error}`);
                socket.destroy();
                callback(undefined, error);
            }
        });

        socket.on("data", buffer => {
            parser.execute(buffer);
        });

        return this;
    }

    // allows clients to register an 'on closed' handler to be notified if the socket unexpectedly gets closed
    public onClose(callback: () => void) {
        this.onCloseCallback = callback;
    }

    // Forces the geofence to be closed
    public close(): void {
        if (this.socket) { this.socket.destroy(); };
    }
}
