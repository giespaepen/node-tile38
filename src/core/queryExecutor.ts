import { Tile38Key, Tile38LiveObjectResult, Tile38ObjectResultSet, Tile38OptionType, Tile38QueryOptions } from "../types";
import { CoreClient } from "./client";
import { LiveGeofence } from "./live";
import { Tile38Query } from "./query";

/**
 * Wrapper class to execute queries
 */
export class QueryExecutor extends Tile38Query {

    constructor(type: Tile38OptionType, key: Tile38Key, options: Tile38QueryOptions = {}, private client: CoreClient) {
        super(type, key, options);
    }

    /**
     * Execute the query
     */
    public async execute<T>() {
        return await this.client.executeForObject<Tile38ObjectResultSet<T>>(
            this.type, ...this.compileCommandArray());
    }

    /**
     * Returns streaming results for a live geofence. This function will repeatedly call the specified callback
     * method when results are received.
     * This method returns an instance of LiveGeofence, which can be used to close the fence if necessary by calling
     * its close() method.
     * 
     * @param callback to process the results
     * @returns LiveGeofence
     */
    public executeFence<T>(callback: (result: Tile38LiveObjectResult<T>, error?: Error) => void): LiveGeofence {
        this.withFence();
        return new LiveGeofence(this.client.getConfig())
            .open(this, callback);
    }
}
