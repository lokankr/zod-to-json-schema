import { z } from "zod";
import { parseRecordDef } from "../../src/parsers/record";
import { getRefs } from "../../src/Refs";

describe("records", () => {
  it("should be possible to describe a simple record", () => {
    const schema = z.record(z.number());

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });

  it("should be possible to describe a complex record with checks", () => {
    const schema = z.record(
      z.object({ foo: z.number().min(2) }).catchall(z.string().cuid())
    );

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          foo: {
            type: "number",
            minimum: 2,
          },
        },
        required: ["foo"],
        additionalProperties: {
          type: "string",
          pattern: "^c[^\\s-]{8,}$",
        },
      },
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });

  it("should be possible to describe a key schema", () => {
    const schema = z.record(z.string().uuid(), z.number());

    const parsedSchema = parseRecordDef(schema._def, getRefs());
    const expectedSchema = {
      type: "object",
      additionalProperties: {
        type: "number",
      },
      propertyNames: {
        format: "uuid",
      },
    };
    expect(parsedSchema).toStrictEqual(expectedSchema);
  });

  describe("with keys as an enum", () => {
    describe("for default format", () => {
      it("should be possible to describe a key with an enum", () => {
        const schema = z.record(z.enum(["foo", "bar"]), z.number());
        const parsedSchema = parseRecordDef(schema._def, getRefs());
        const expectedSchema = {
          type: "object",
          additionalProperties: {
            type: "number",
          },
          propertyNames: {
            enum: ["foo", "bar"],
          },
        };
        expect(parsedSchema).toStrictEqual(expectedSchema);
      });
    });

    describe("with openapi3 format", () => {
      it("should be possible to describe a key with an enum", () => {
        const schema = z.record(z.enum(["foo", "bar"]), z.number());
        const parsedSchema = parseRecordDef(
          schema._def,
          getRefs({ target: "openApi3" })
        );
        const expectedSchema = {
          type: "object",
          additionalProperties: {
            type: "number",
          },
          properties: {
            foo: { $ref: "#/additionalProperties" },
            bar: { $ref: "#/additionalProperties" },
          },
        };
        expect(parsedSchema).toStrictEqual(expectedSchema);
      });
    });
  });
});
