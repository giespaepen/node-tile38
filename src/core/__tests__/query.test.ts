import { Tile38Query } from "../query";

describe("Tests for the Query class", () => {
    it("Should create a query object", () => {
        // Act
        const query = new Tile38Query("NEARBY", "test");

        // Assert
        expect(query).not.toBeNull();
    });

    it("Should create a query with CURSOR", () => {
        // Arrange
        const expected = "NEARBY test CURSOR 1 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withCursor(1);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with LIMIT", () => {
        // Arrange
        const expected = "NEARBY test LIMIT 1 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withLimit(1);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with SPREAD", () => {
        // Arrange
        const expected = "NEARBY test SPARSE 1 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withSparse(1);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with MATCH", () => {
        // Arrange
        const expected = "NEARBY test MATCH truck* POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withMatch("truck*");

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with MATCH", () => {
        // Arrange
        const expected = "NEARBY test MATCH truck* POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withMatch("truck*");

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with DISTANCE", () => {
        // Arrange
        const expected = "NEARBY test DISTANCE POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withDistance();

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with WHERE", () => {
        // Arrange
        const expected = "NEARBY test WHERE speed 30 60 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withWhere("speed", 30, 60);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });

    it("Should create a query with WHEREIN", () => {
        // Arrange
        const expected = "NEARBY test WHEREIN speed 2 30 60 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withWhereIn("speed", 30, 60);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });
});
