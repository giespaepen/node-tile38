import { Tile38OptionType, Tile38QueryOptions } from ".";
import { Tile38Config } from "../config";
import { Tile38Key } from "../types/commands";
import { CoreClient } from "./client";
import { QueryExecutor } from "./queryExecutor";

/**
 * Use this class to create query executors.
 */
export class QueryFactory {

    /**
     * Create an instance of the QueryFactory. 
     * 
     * @param config 
     * @param client 
     */
    public constructor(private config: Tile38Config, private client: CoreClient) { }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an INTERSECTS search.
     * https://tile38.com/commands/intersects/
     * 
     * @param key saved key
     */
    public intersects(key: Tile38Key): QueryExecutor {
        return this.executor("INTERSECTS", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an SEARCH search.
     * https://tile38.com/commands/search/
     * 
     * @param key saved key
     */
    public search(key: Tile38Key): QueryExecutor {
        return this.executor("SEARCH", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an NEARBY search.
     * https://tile38.com/commands/nearby/
     * 
     * @param key saved key
     */
    public nearby(key: Tile38Key): QueryExecutor {
        return this.executor("NEARBY", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an SCAN search.
     * https://tile38.com/commands/scan/
     * 
     * @param key saved key
     */
    public scan(key: Tile38Key): QueryExecutor {
        return this.executor("SCAN", key);
    }

    /**
     * Factory method to create a new Tile38Query(Executor) object for an WITHIN search.
     * https://tile38.com/commands/within/
     * 
     * @param key saved key
     */
    public within(key: Tile38Key): QueryExecutor {
        return this.executor("WITHIN", key);
    }

    /**
     * Create a query executor for a given Tile38 query.
     * 
     * @param key saved key
     */
    public executor(type: Tile38OptionType, key: Tile38Key, options: Tile38QueryOptions = {}): QueryExecutor {
        return new QueryExecutor(type, key, options, this.client);
    }
}
