import { Tile38Argument, Tile38DetectEvents, Tile38OptionType, Tile38QueryOptions } from "../types";
import { Tile38Command, Tile38Id, Tile38Key } from "../types/commands";

/**
 * Builder for Tile38 queries. The queries should have the following form.
 * At this point 
 */
export class Tile38Query {

    public constructor(
        public type: Tile38Command,
        private key: Tile38Key,
        private options: Tile38QueryOptions = {}) { }


    /**
     * CURSOR is used to iterate though many objects from the search results. An iteration begins when 
     * the CURSOR is set to Zero or not included with the request, and completes when the 
     * cursor returned by the server is Zero.
     * 
     * @param start start position
     */
    withCursor(start: number) {
        this.options.cursor = ["CURSOR", start];
        return this;
    }

    /**
     * LIMIT can be used to limit the number of objects returned for a single search request.
     * 
     * @param count number of results
     */
    withLimit(count: number) {
        this.options.limit = ["LIMIT", count];
        return this;
    }

    /**
     * SPARSE will distribute the results of a search evenly across the requested area. 
     * This is very helpful for example; when you have many (perhaps millions) of objects 
     * and do not want them all clustered together on a map. Sparse will limit the number 
     * of objects returned and provide them evenly distributed so that your map looks clean.
     * 
     * You can choose a value between 1 and 8. The value 1 will result in no more than 4 items. The value 8 will result in no more than 65536.
     * 
     * @param spread number between 1 and 8
     */
    withSparse(spread: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8) {
        this.options.sparse = ["SPARSE", spread];
        return this;
    }

    /**
     * MATCH is similar to WHERE except that it works on the object id instead of fields. 
     * For example: 'nearby fleet match truck* point 33.462 -112.268 6000' will return only the 
     * objects in the ‘fleet’ collection that are within the 6 km radius and have an object id 
     * that starts with truck. There can be multiple MATCH options in a single search. 
     * The MATCH value is a simple glob pattern.
     * 
     * @param value match pattern
     */
    withMatch(value: number | string) {
        this.options.matches = ["MATCH", value, ...(this.options.matches || [])];
        return this;
    }

    /**
     * Sort order for SCAN query, must be 'asc' or 'desc'.
     * 
     * @param direction 
     */
    order(direction: Tile38OptionType & ("ASC" | "DESC")) {
        this.options.order = [direction];
        return this;
    }

    /** 
     * Equivalent of order('asc');
     */
    withOrderAscending() {
        return this.order("ASC");
    }
    /** 
     * Equivalent of order('desc');
     */
    withOrderDescending() {
        return this.order("DESC");
    }

    /**
     * Adds a distance argument
     */
    withDistance() {
        this.options.distance = ["DISTANCE"];
        return this;
    }

    /**
     * Adds a fence argument
     */
    withFence() {
        this.options.fence = ["FENCE"];
        return this;
    }

    /**
     * WHERE allows for filtering out results based on field values. 
     * For example: 'nearby fleet where speed 70 +inf point 33.462 -112.268 6000' will return 
     * only the objects in the ‘fleet’ collection that are within the 6 km radius and 
     * have a field named speed that is greater than 70.
     * 
     * Multiple WHEREs are concatenated as and clauses. WHERE speed 70 +inf WHERE age -inf 24 
     * would be interpreted as speed is over 70 and age is less than 24. The default value 
     * for a field is always 0. Thus if you do a WHERE on the field speed and an object 
     * does not have that field set, the server will pretend that the object does and that 
     * the value is Zero.
     * 
     * For example: query.where('speed', 70, '+inf').where('age', '-inf', 24)
     * 
     * @param field field name for clause
     * @param criteria criterium
     */
    withWhere(field: string, ...criteria: Tile38Argument[]) {
        const previous = this.options.where || [];
        this.options.where = ["WHERE", field, ...criteria];
        this.options.where.push(...previous);
        return this;
    }

    /**
     * WHEREIN is similar to WHERE except that it checks whether the object’s field value is in a given list. 
     * For example 'nearby fleet where wheels 3 14 18 22 point 33.462 -112.268 6000'  will return only the objects 
     * in the ‘fleet’ collection that are within the 6 km radius and have a field 
     * named wheels that is either 14 or 18 or 22.
     * 
     * Multiple WHEREINs are concatenated as and clauses. WHEREIN doors 2 2 5 WHEREIN wheels 3 14 18 22 
     * would be interpreted as doors is either 2 or 5 and wheels is either 14 or 18 or 22. 
     * The default value for a field is always 0. Thus if you do a WHEREIN on the field wheels and an object 
     * does not have that field set, the server will pretend that the object does and that the value is Zero.
     * 
     */
    withWhereIn(field: string, ...values: Tile38Argument[]) {
        const previous = this.options.whereIn || [];
        this.options.whereIn = ["WHEREIN", field, values.length, ...values];
        this.options.whereIn.push(...previous);
        return this;
    }

    /**
     * WHEREEVAL - similar to WHERE except that matching decision is made by Lua script. 
     * For example 'nearby fleet whereeval "return FIELDS.wheels > ARGV[1] or (FIELDS.length * FIELDS.width) > ARGV[2]" 2 8 120 point 33.462 -112.268 6000' 
     * will return only the objects in the fleet collection that are within the 6km radius and have a 
     * field named wheels that is above 8, or have length and width whose product is greater than 120. 
     * 
     * Multiple WHEREEVALs are concatenated as and clauses. See EVAL command for more details. Note that, unlike the EVAL command, 
     * WHEREVAL Lua environment (1) does not have KEYS global, and (2) has the FIELDS global with the Lua 
     * table of the iterated object’s fields.
     * 
     * @param script lua script
     * @param args 
     */
    withWhereEval(script: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEval || [];
        this.options.whereEval = ["WHEREEVAL", `"${script}"`, args.length, ...args];
        this.options.whereEval.push(...previous);
        return this;
    }

    /**
     * WHEREEVALSHA - similar to WHERE except that matching decision is made by Lua script. 
     * For example 'nearby fleet whereeval "return FIELDS.wheels > ARGV[1] or (FIELDS.length * FIELDS.width) > ARGV[2]" 2 8 120 point 33.462 -112.268 6000' 
     * will return only the objects in the fleet collection that are within the 6km radius and have a 
     * field named wheels that is above 8, or have length and width whose product is greater than 120. 
     * 
     * Multiple WHEREEVALs are concatenated as and clauses. See EVAL command for more details. Note that, unlike the EVAL command, 
     * WHEREVAL Lua environment (1) does not have KEYS global, and (2) has the FIELDS global with the Lua 
     * table of the iterated object’s fields.
     * 
     * @param sha 
     * @param args 
     */
    withWhereEvalSha(sha: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEvalSha || [];
        this.options.whereEvalSha = ["WHEREEVALSHA", sha, args.length, ...args];
        this.options.whereEvalSha.push(...previous);
        return this;
    }

    /**
     * CLIP tells the server to clip intersecting objects by the bounding box area of 
     * the search. It can only be used with these area formats: BOUNDS, TILE, QUADKEY, HASH.
     */
    withClip() {
        this.options.clip = ["CLIP"];
        return this;
    }

    /*
     * call nofields to exclude field values from search results
     */
    withNoFields() {
        this.options.noFields = ["NOFIELDS"];
        return this;
    }

    /*
     * sets one or more detect values. For example:
     * query.detect('inside', 'outside');
     *   or
     * query.detect('inside,outside');
     *
     * whichever you prefer
     */
    withDetect(...values: Tile38DetectEvents[]) {
        this.options.detect = ["DETECT", values.join(",")];
        return this;
    }

    /**
     * sets commands to listen for. Expected values: del, drop and set
     * You may pass these as separate parameters,
     *   query.commands('del', 'drop', 'set');
     *
     * or as a single comma separated parameter
     *   query.commands('del,drop,set');
     */
    withCommands(...values: string[]) {
        this.options.commands = ["COMMANDS", values.join(",")];
        return this;
    }

    /**
     * set output type. Allowed values:
     * count
     * ids
     * objects
     * points
     * bounds
     * hashes
     *
     * If 'hashes' is used a second parameter should specify the precision, ie
     *   query.output('hashes', 6);
     *
     * Note that all of these types, except for 'bounds' can be called using convenience methods as well,
     * so
     *   objects() instead of output('objects')
     * and
     *   hashes(6) instead of output('hashes', 6)
     *
     */
    withOutput(type: Tile38OptionType & ("IDS" | "COUNT" | "OBJECTS" | "POINTS" | "HASHES"), precision?: number) {
        if (type == "HASHES" && precision && precision > 0) {
            this.options.output = [type, precision];
        } else {
            this.options.output = [type];
        }
        return this;
    }

    // shortcut for .output('ids')
    withIds() {
        return this.withOutput("IDS");
    }
    // shortcut for .output('count')
    withCount() {
        return this.withOutput("COUNT");
    }
    // shortcut for .output('objects')
    withObjects() {
        return this.withOutput("OBJECTS");
    }
    // shortcut for .output('points')
    withPoints() {
        return this.withOutput("POINTS");
    }
    // shortcut for .output('points')
    withHashes(precision: number) {
        return this.withOutput("HASHES", precision);
    }

    /**
     * Conducts search with an object that's already in the database
     * https://tile38.com/commands/get/ 
     * 
     * @param key 
     * @param id 
     */
    withGetObject(key: Tile38Key, id: Tile38Id) {
        this.options.getObject = ["GET", key, id];
        return this;
    }

    /**
     * Conducts search with bounds coordinates
     * https://tile38.com/topics/object-types/#bounds 
     * 
     * @param minlat 
     * @param minlon 
     * @param maxlat 
     * @param maxlon 
     */
    withBounds(minlat: number, minlon: number, maxlat: number, maxlon: number) {
        this.options.bounds = ["BOUNDS", minlat, minlon, maxlat, maxlon];
        return this;
    }

    /**
     * Conducts search with geojson object
     * @param geojson 
     */
    withObject(geojson: GeoJSON.GeoJsonObject) {
        this.options.geojson = ["OBJECT", JSON.stringify(geojson)];
        return this;
    }

    /**
     * Adds a TILE to the query
     * https://tile38.com/topics/object-types/#xyz-tile 
     * 
     * @param x 
     * @param y 
     * @param z 
     */
    withTile(x: number, y: number, z: number) {
        this.options.tile = ["TILE", x, y, z];
        return this;
    }

    /**
     * Adds a QUADKEY to the query
     * https://tile38.com/topics/object-types/#quadkey 
     * 
     * @param quadkey 
     */
    withQuadKey(quadkey: Tile38Key | Tile38Argument) {
        this.options.quadKey = ["QUADKEY", quadkey];
        return this;
    }

    /**
     * Adds a HASH to the query
     * 
     * @param geohash 
     */
    withHash(geohash: string) {
        this.options.hash = ["HASH", geohash];
        return this;
    }

    /**
     * Adds CIRCLE arguments to WITHIN / INTERSECTS queries
     * 
     * @param lat 
     * @param lon 
     * @param radius 
     */
    withCircle(lat: number, lon: number, radius: number) {
        this.options.circle = ["CIRCLE", lat, lon, radius];
        return this;
    }

    /**
     * adds POINT arguments to NEARBY query.
     * 
     * @param lat 
     * @param lon 
     * @param meters 
     */
    withPoint(lat: number, lon: number, meters?: number) {
        this.options.point = ["POINT", lat, lon];
        if (meters) {
            this.options.point.push(meters);
        }
        return this;
    }

    /**
     * Adds ROAM arguments to NEARBY query
     * 
     * @param key 
     * @param pattern 
     * @param meters 
     */
    withRoam(key: Tile38Key, pattern: string, meters: number) {
        // TODO throw error if type != 'NEARBY'
        this.options.roam = ["ROAM", key, pattern, meters];
        return this;
    }

    /**
     * Return all the commands of the query chain, as a string, the way it will
    // be sent to Tile38
     */
    public compileCommand(): string {
        return this.type + " " + this.compileCommandArray().join(" ");
    }

    // constructs the full array for all arguments of the query.
    // Hacky typing...
    public compileCommandArray(): string[] {
        return this.commandOrder()
            .map((command) => this.options[command])
            .filter(command => command)
            .reduce((prev, current) => {
                if (current instanceof Array) {
                    (prev as string[]).push(...current);
                }
                return prev;
            }, [this.key]) as string[];
    }

    /**
     * The list of ordered commands. Just like the order of keywords in a SQL command. 
     * More information: 
     * 
     * https://tile38.com/commands/nearby/
     * https://tile38.com/commands/within/
     * https://tile38.com/commands/search/
     * https://tile38.com/commands/intersects/
     * https://tile38.com/commands/scan/
     * 
     */
    public commandOrder(): (keyof Tile38QueryOptions)[] {
        return ["cursor", "limit", "sparse", "matches", "order", "distance", "where",
            "whereIn", "whereEval", "whereEvalSha", "clip", "nofields", "fence", "detect",
            "commands", "output", "getObject", "bounds", "geojson", "tile", "quadKey", "hash",
            "point", "circle", "roam"];
    }

    public toString() {
        return this.compileCommand();
    }
}
