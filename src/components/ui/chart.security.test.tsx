import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChartStyle, sanitizeCssColorValue, type ChartConfig } from "./chart";

describe("sanitizeCssColorValue", () => {
  it("rejects HTML/style breaking payloads", () => {
    expect(sanitizeCssColorValue("</style><script>alert(1)</script>")).toBeNull();
    expect(sanitizeCssColorValue("red\n</style>")).toBeNull();
    expect(sanitizeCssColorValue("<img src=x onerror=alert(1)>")).toBeNull();
  });

  it("accepts common safe color formats", () => {
    expect(sanitizeCssColorValue("#F8C800")).toBe("#F8C800");
    expect(sanitizeCssColorValue("hsl(46 100% 55%)")).toBe("hsl(46 100% 55%)");
    expect(sanitizeCssColorValue("rgb(0 0 0 / 0.5)")).toBe("rgb(0 0 0 / 0.5)");
    expect(sanitizeCssColorValue("var(--brand-yellow)")).toBe("var(--brand-yellow)");
    expect(sanitizeCssColorValue("hsl(var(--brand-yellow))")).toBe("hsl(var(--brand-yellow))");
  });
});

describe("ChartStyle", () => {
  it("does not emit unsafe CSS values into the style tag", () => {
    const config: ChartConfig = {
      safe: { color: "#F8C800" },
      unsafe: { color: "</style><script>alert(1)</script>" },
    };

    const { container } = render(<ChartStyle id="test" config={config} />);
    const style = container.querySelector("style");
    expect(style).not.toBeNull();

    const css = style?.innerHTML ?? "";
    expect(css).not.toContain("</style>");
    expect(css).not.toContain("<script");
  });
});

