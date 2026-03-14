import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { CspEvaluator } from "csp_evaluator/dist/evaluator.js";
import { CspParser } from "csp_evaluator/dist/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function getVercelHeaders(vercelConfig) {
  const headers = Array.isArray(vercelConfig.headers) ? vercelConfig.headers : [];
  const global = headers.find((h) => h && h.source === "/(.*)");
  const items = global && Array.isArray(global.headers) ? global.headers : [];
  const map = new Map();
  for (const h of items) {
    if (!h?.key || typeof h.key !== "string") continue;
    map.set(h.key.toLowerCase(), `${h.value ?? ""}`);
  }
  return map;
}

function evaluateCsp(policy) {
  const parsed = new CspParser(policy).csp;
  const findings = new CspEvaluator(parsed).evaluate();
  return Array.isArray(findings) ? findings : [];
}

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const vercelPath = path.join(repoRoot, "vercel.json");
  if (!fs.existsSync(vercelPath)) {
    fail(`vercel.json não encontrado em: ${vercelPath}`);
  }

  const vercel = readJson(vercelPath);
  const headers = getVercelHeaders(vercel);

  const requiredHeaders = [
    "content-security-policy",
    "referrer-policy",
    "x-content-type-options",
    "x-frame-options",
    "permissions-policy",
    "strict-transport-security",
  ];

  const missingHeaders = requiredHeaders.filter((h) => !headers.get(h));
  if (missingHeaders.length) {
    fail(`Headers defensivos ausentes no vercel.json: ${missingHeaders.join(", ")}`);
  }

  const csp = headers.get("content-security-policy");
  if (!csp) {
    fail("CSP ausente no vercel.json.");
  }

  const mustContain = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "script-src 'self'",
  ];

  const missingDirectives = mustContain.filter((d) => !csp.includes(d));
  if (missingDirectives.length) {
    fail(`CSP sem diretivas mínimas esperadas: ${missingDirectives.join(" | ")}`);
  }

  if (/\bunsafe-eval\b/i.test(csp)) {
    fail("CSP contém 'unsafe-eval' (não permitido).");
  }

  const findings = evaluateCsp(csp);
  const high = findings.filter((f) => {
    if (!(typeof f?.severity === "number" && f.severity >= 50)) return false;
    if (f.directive === "script-src" && (f.value === "'self'" || f.value === "self")) return false;
    return true;
  });
  if (high.length) {
    process.stderr.write("CSP findings (severity >= 50):\n");
    for (const f of high) {
      const directive = f.directive ? ` (${f.directive})` : "";
      const value = f.value ? `: ${f.value}` : "";
      process.stderr.write(`- [${f.severity}] ${f.description}${directive}${value}\n`);
    }
    process.exit(1);
  }

  process.stdout.write("security-check: OK\n");
}

main();
