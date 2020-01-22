import { Tile38Coord, Tile38DetectEvents, Tile38Id, Tile38Key } from "../core";

export type BaseTile38Response = {
    count?: number;
    cursor?: number;
    elapsed: number;
    err: string | unknown;
    ok: boolean;
}

export type Tile38Response<T> = BaseTile38Response & T;

export type AnyRedisResponse = Tile38Response<unknown>;

/**
 * More information: https://tile38.com/commands/server/
 */
export type Tile38Stats = {
    aof_size: number;
    avg_item_size: number;
    caught_up: true;
    following: string;
    heap_size: number;
    id: string;
    in_memory_size: number;
    num_collections: number;
    num_objects: number;
    num_points: number;
    pointer_size: number;
    read_only: boolean;
};

export type Tile38Pong = "pong";

export type Tile38Hook = {
    name: string;
    key: Tile38Key;
    endpoints: string[];
    command: string[];
};

export type Tile38ObjectResult<T> = {
    id: Tile38Id;
    object: Tile38Coord | "string" | T;
}

export type Tile38ObjectResultSet<T> = {
    objects: Tile38ObjectResult<T>[];
    count: number;
    cursor: number;
}

export type Tile38LiveObjectResult<T> = {
    command?: string;
    detect: Tile38DetectEvents;
    fields?: { [key: string]: number };
    group: string;
    id: Tile38Id;
    key: Tile38Key;
    object: Tile38Coord | "string" | T;
    time: string;
} | "string" | undefined;
