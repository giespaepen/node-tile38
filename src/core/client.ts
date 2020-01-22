import { RedisClient } from "redis";

import { mergeConfig, Tile38Config } from "../config";
import { Tile38Command, Tile38Response } from "../types";

/**
 * Core Tile38 class to abstract common tasks from the configuration.
 */
export class CoreClient {

    public id: string;

    protected config: Tile38Config;
    protected client: RedisClient;

    private initialized = false;
    private debounceInitialized = 250;

    constructor(config?: Partial<Tile38Config>, client?: RedisClient) {
        // Give each instance an unique id
        this.id = `tile38-${Math.floor(Math.random() * 10000)}-${new Date().getTime()}`;

        this.config = mergeConfig(config);
        this.client = client || new RedisClient(this.config);

        const { logging } = this.config;

        // Configure the client
        this.client.on("error", (error) => this.onClientError(error));

        // Set the output to json
        this.client.on("connect", () => {
            logging.log(`Tile38 client ${this.id} connected to ${this.config.host}:${this.config.port}`);
            this.client.sendCommand("OUTPUT", ["json"], (error) => {
                if (!error) {
                    this.config.logging.debug("Server output set to json");
                } else {
                    this.config.logging.error(`Cannot initialize Tile38 ${this.id}`);
                }
                this.initialized = true;
            });
        });
    }

    /**
     * Get the configuration
     */
    public getConfig() {
        return this.config;
    }

    /**
     * Execute and return a single value from the return value
     * 
     * @param command 
     * @param key 
     * @param args 
     */
    public async executeForSingleField<T>(command: Tile38Command, key: keyof T, ...args: unknown[]): Promise<Tile38Response<T>[keyof T]> {
        return await this
            .execute<T>(command, ...args)
            .then((result) => this.getResultField(result, key))
            .catch((error) => {
                const message = `Command ${command} failed: ${error.message}`;
                this.config.logging.error(message);
                this.config.logging.debug(error);
                throw new Error(message);
            });
    }

    /**
     * Execute and return the object without control values (ok, elapsed)
     * 
     * @param command 
     * @param args 
     */
    public async executeForObject<T>(command: Tile38Command, ...args: unknown[]): Promise<T> {
        return await this
            .execute<T>(command, ...args)
            .then((result) => this.getResultObject(result));
    }

    /**
     * Execute and return the value of the OK field, which is a boolean
     * 
     * @param command 
     * @param args 
     */
    public async executeForOK(command: Tile38Command, ...args: unknown[]): Promise<boolean> {
        return await this.executeForSingleField(command, "ok", ...args);
    }

    /**
     * Send a command with optional arguments to the Redis driver, and return the response in a Promise.
     * If returnProp is set, it will assume that the response is a JSON string, then parse and return
     * the given property from that string.
     * 
     * @param command command
     * @param args optional command arguments
     */
    protected async execute<T>(command: Tile38Command, ...args: unknown[]): Promise<Tile38Response<T>> {
        const { logging } = this.config;

        // Debounce if not initialized (constructor contains async methods)
        if (!this.initialized) {
            logging.debug(`Tile38 client ${this.id} is not initialized. Debounce execute for ${this.debounceInitialized}ms`);
            return new Promise<Tile38Response<T>>((resolve, reject) => {
                setTimeout(() => {
                    this.execute(command, ...args)
                        .then((value) => resolve(value as Tile38Response<T>))
                        .catch((error) => reject(error));
                }, this.debounceInitialized);
            });
        }

        return new Promise<Tile38Response<T>>((resolve, reject) => {
            const rawCommand = `${command} ${args.join(" ")}`.trim();
            logging.debug(`${rawCommand}: executing`);
            this.client.sendCommand(command, args, (error, rawResult: string) => {
                const result: Tile38Response<T> = JSON.parse(rawResult);
                if (error) {
                    if (this.config.debug) {
                        logging.warn(`Command ${command} failed: ${error.message}`)
                        logging.debug(error);
                    }
                    reject(error);
                }

                if (result.ok) {
                    logging.debug(`${rawCommand}: elapsed ${result.elapsed}`);
                    resolve(result);
                } else {
                    if (result.err) {
                        reject(result.err);
                    } else {
                        reject(`${rawCommand}: unexpected response: ${result}`);
                    }
                }
            });
        });
    }

    /**
     * Get a single field from the result.
     * 
     * @param result 
     * @param key 
     */
    protected getResultField<T>(result: Tile38Response<T>, key: keyof T): Tile38Response<T>[keyof T] {
        return result[key];
    }

    /**
     * Get all result fields except the control fields ok and elapsed.
     * 
     * @param result 
     */
    protected getResultObject<T>(result: Tile38Response<T>): T {
        delete result.ok;
        delete result.elapsed;
        return result;
    }

    /**
     * Handle client errors
     * @param error connection error
     */
    protected onClientError(error: unknown) {
        this.config.logging.error(`Tile38 client error: ${error}`);
    }

    /**
     * Close the client
     */
    protected async close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.client.quit((error) => {
                if (!error) {
                    this.config.logging.log(`Tile38 client ${this.id} disconnected`);
                    resolve();
                } else {
                    reject(error);
                }
            });
        });
    }
}
