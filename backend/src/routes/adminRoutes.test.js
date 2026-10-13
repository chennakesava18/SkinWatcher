import assert from "node:assert/strict";
import test from "node:test";
import adminRoutes from "./adminRoutes.js";

test("admin router protects every endpoint and exposes required sections", () => {
  const middlewareNames = adminRoutes.stack.slice(0, 2).map((layer) => layer.name);
  assert.deepEqual(middlewareNames, ["protect", "requireAdmin"]);
  const routes = adminRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  assert.deepEqual(routes, [
    "GET /overview",
    "GET /users",
    "GET /users/:id",
    "PATCH /users/:id/status",
    "PATCH /users/:id/role",
    "GET /analytics",
    "GET /activity",
    "GET /status",
    "GET /doctors",
    "POST /doctors",
    "PATCH /doctors/:id",
    "PATCH /doctors/:id/status",
    "DELETE /doctors/:id"
  ]);
});
