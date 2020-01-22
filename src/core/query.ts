import { Tile38Argument, Tile38DetectEvents, Tile38OptionType, Tile38QueryOptions } from "../types";
import { Tile38Id, Tile38Key } from "../types/commands";

export class Tile38Query {

    public constructor(
        public type: Tile38OptionType,
        private key: Tile38Key,
        private options: Tile38QueryOptions = {}) { }


    withCursor(start: number) {
        this.options.cursor = ["CURSOR", start];
        return this;
    }

    withLimit(count: number) {
        this.options.limit = ["LIMIT", count];
        return this;
    }

    withSparse(spread: number) {
        this.options.sparse = ["SPARSE", spread];
        return this;
    }

    /*
     * set a matching query on the object ID. The value is a glob pattern.
     * Unlike other query methods in this class, match() may be called multiple times
     */
    withMatch(value: number | string) {
        this.options.matches = ["MATCH", value, ...(this.options.matches || [])];
        return this;
    }

    // sort order for SCAN query, must be 'asc' or 'desc'
    order(direction: Tile38OptionType & ("ASC" | "DESC")) {
        this.options.order = [direction];
        return this;
    }

    // equivalent of order('asc')
    withOrderAscending() {
        return this.order("ASC");
    }
    // equivalent of order('desc');
    withOrderDescending() {
        return this.order("DESC");
    }

    // adds DISTANCE argument for nearby query.
    withDistance() {
        this.options.distance = ["DISTANCE"];
        return this;
    }

    withFence() {
        this.options.fence = ["FENCE"];
        return this;
    }

    /*
     * set a where search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     * query.where('speed', 70, '+inf').where('age', '-inf', 24)
     */
    withWhere(field: string, ...criteria: Tile38Argument[]) {
        const previous = this.options.where || [];
        this.options.where = ["WHERE", field, ...criteria];
        this.options.where.push(...previous);
        return this;
    }

    /*
     * set a wherein search pattern. Like match, this method may be chained multiple times
     * as well. For example:
     *   query.wherein('doors', 2, 5).wherein('wheels', 14, 18, 22)
     * Would generate the command:
     *   WHEREIN doors 2 2 5 WHEREIN wheels 3 14 18 22
     * (note that the command to the server includes the argument count, while the
     * js api doesn't need this)
     */
    withWhereIn(field: string, ...values: Tile38Argument[]) {
        const previous = this.options.whereIn || [];
        this.options.whereIn = ["WHEREIN", field, values.length, ...values];
        this.options.whereIn.push(...previous);
        return this;
    }

    withWhereEval(script: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEval || [];
        this.options.whereEval = ["WHEREEVAL", `"${script}"`, args.length, ...args];
        this.options.whereEval.push(...previous);
        return this;
    }

    withWhereEvalSha(sha: string, ...args: Tile38Argument[]) {
        const previous = this.options.whereEvalSha || [];
        this.options.whereEvalSha = ["WHEREEVALSHA", sha, args.length, ...args];
        this.options.whereEvalSha.push(...previous);
        return this;
    }

    /*
     * clip intersecting objects
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
