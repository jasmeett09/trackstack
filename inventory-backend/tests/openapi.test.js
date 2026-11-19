const { buildOpenApiSpec, groupedEndpoints } = require("../src/config/openapi");

describe("OpenAPI documentation coverage", () => {
  test("documents notification endpoints", () => {
    const spec = buildOpenApiSpec("http://localhost:5000");

    expect(spec.paths["/api/notifications"]).toBeDefined();
    expect(spec.paths["/api/notifications/{notificationId}/read"]).toBeDefined();
    expect(spec.paths["/api/notifications/read-all"]).toBeDefined();
    expect(spec.components.schemas.notificationSummary).toBeDefined();
  });

  test("documents report export endpoints", () => {
    const spec = buildOpenApiSpec("http://localhost:5000");

    expect(spec.paths["/api/reports/export/inventory-pdf"]).toBeDefined();
    expect(spec.paths["/api/reports/export/sales-csv"]).toBeDefined();
    expect(spec.paths["/api/reports/export/purchases-csv"]).toBeDefined();
  });

  test("shows notifications and reports in grouped endpoint summary", () => {
    const titles = groupedEndpoints.map((group) => group.title);

    expect(titles).toContain("Notifications");
    expect(titles).toContain("Reports");
  });
});
