import { Tile38Query } from "../query";

describe("Tests for the Query class", () => {
    it("Should create a query object", () => {
        // Act
        const query = new Tile38Query("NEARBY", "test");

        // Assert
        expect(query).not.toBeNull();
    });

    it("Should create a query with cursor", () => {
        // Arrange
        const expected = "NEARBY test CURSOR 1 POINT 0 0";
        const query = new Tile38Query("NEARBY", "test")
            .withPoint(0, 0)
            .withCursor(1);

        // Act
        const actual = query.toString();

        expect(actual).toBe(expected);
    });
});