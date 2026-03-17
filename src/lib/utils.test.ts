import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsy values", () => {
    const maybe: string | undefined = undefined;
    expect(cn("text-sm", maybe, null, undefined, "font-bold")).toBe("text-sm font-bold");
  });
});
