export type Tile38SafeJSONValue = string | number | boolean;
export type Tile38SafeJSON = { [key: string]: Tile38SafeJSONValue };

function isObject(object: unknown): object is { [key: string]: unknown } {
    return (object && typeof object === "object" && Object.keys(object as Object).length > 0);
}

function isPrimitive(value: unknown): value is Tile38SafeJSONValue {
    return value && (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    );
}

export function toSafeJson(object: { [key: string]: unknown }, path: string[] = []): Tile38SafeJSON {
    let result: Tile38SafeJSON = {};
    if (isObject(object)) {
        Object.keys(object).forEach((key) => {
            const value = object[key];
            if (isPrimitive(value)) {
                const resultKey = [...path, key].join(".");
                result[[...path, key].join(".")] = value;
            }
            if (isObject(value)) {
                result = { ...result, ...toSafeJson(value, [...path, key]) }
            }
        });
    }
    return result;
}