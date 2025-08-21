import crypto from "crypto";

export function deviceHash(req) {
  const ua = req.get("user-agent") || "";
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.ip || "";
  return crypto.createHash("sha256").update(`${ua}|${ip}`).digest("hex");
}
