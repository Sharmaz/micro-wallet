import { describe, expect, it } from "vitest";

import { SPECIFICATION_EXAMPLE_PAYEE_NODE_ID, specificationExamples } from "./bolt11SpecificationExamples.js";

import { recoverPayeeNodeId } from "@/infrastructure/bolt11/recoverPayeeNodeId.js";

describe("recoverPayeeNodeId", () => {
  it.each(specificationExamples)("recovers the payee node id from the BOLT 11 example: $exampleDescription", ({ invoice }) => {
    expect(recoverPayeeNodeId(invoice)).toBe(SPECIFICATION_EXAMPLE_PAYEE_NODE_ID);
  });

  it("throws when the text is not a bech32 invoice", () => {
    expect(() => recoverPayeeNodeId("not an invoice")).toThrow();
  });
});
