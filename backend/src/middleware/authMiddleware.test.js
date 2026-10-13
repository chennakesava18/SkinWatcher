import assert from "node:assert/strict";
import test from "node:test";
import { requireAdmin } from "./authMiddleware.js";

const response = () => {
  const state = { statusCode: 200 };
  return { state, status(code) { state.statusCode = code; return this; } };
};

test("normal users are rejected by the backend admin guard", () => {
  const res = response();
  let nextError;
  requireAdmin({ user: { role: "user" } }, res, (error) => { nextError = error; });
  assert.equal(res.state.statusCode, 403);
  assert.equal(nextError.message, "Admin access required");
});

test("admin users pass the backend admin guard", () => {
  const res = response();
  let called = false;
  requireAdmin({ user: { role: "admin" } }, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(res.state.statusCode, 200);
});
