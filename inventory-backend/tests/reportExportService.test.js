jest.mock("../src/config/prisma", () => ({
  prisma: {
    item: {
      findMany: jest.fn()
    },
    sale: {
      findMany: jest.fn()
    },
    purchase: {
      findMany: jest.fn()
    }
  }
}));

jest.mock("../src/services/tenantService", () => ({
  getTenantContext: jest.fn()
}));

const { prisma } = require("../src/config/prisma");
const { getTenantContext } = require("../src/services/tenantService");
const reportExportService = require("../src/services/reportExportService");

describe("reportExportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTenantContext.mockResolvedValue({
      organizationId: "org-1",
      user: {
        id: "user-1",
        organizationId: "org-1",
        organization: {
          organizationName: "Acme Traders"
        }
      }
    });
  });

  test("builds inventory PDF export with organization data", async () => {
    prisma.item.findMany.mockResolvedValue([
      {
        id: "item-1",
        name: "Laptop",
        quantity: 4,
        reorderLevel: 10,
        unit: "pcs",
        price: 80000,
        category: { name: "Electronics" },
        supplier: { name: "Vertex Supply" }
      }
    ]);

    const result = await reportExportService.getInventoryPdfExport("user-1");

    expect(result.fileName).toMatch(/^inventory-report-/);
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.toString("utf8")).toContain("%PDF-1.4");
    expect(prisma.item.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1" }
    }));
  });

  test("builds sales CSV export scoped to the organization", async () => {
    prisma.sale.findMany.mockResolvedValue([
      {
        id: "sale-1",
        saleDate: new Date("2026-08-10T10:00:00.000Z"),
        customerName: "Orbit Solutions",
        quantity: 2,
        sellingPrice: 85000,
        note: "Urgent dispatch",
        item: { name: "Laptop" }
      }
    ]);

    const result = await reportExportService.getSalesCsvExport("user-1");
    const csv = result.buffer.toString("utf8");

    expect(result.fileName).toMatch(/^sales-report-/);
    expect(csv).toContain("Sale ID,Date,Item,Customer,Quantity,Selling Price,Revenue,Note");
    expect(csv).toContain("sale-1");
    expect(csv).toContain("Orbit Solutions");
    expect(prisma.sale.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1" }
    }));
  });

  test("builds purchases CSV export scoped to the organization", async () => {
    prisma.purchase.findMany.mockResolvedValue([
      {
        id: "purchase-1",
        purchaseDate: new Date("2026-08-09T09:00:00.000Z"),
        quantity: 5,
        purchasePrice: 62000,
        note: "Restock batch",
        item: { name: "Monitor" },
        supplier: { name: "Vertex Supply" }
      }
    ]);

    const result = await reportExportService.getPurchasesCsvExport("user-1");
    const csv = result.buffer.toString("utf8");

    expect(result.fileName).toMatch(/^purchase-report-/);
    expect(csv).toContain("Purchase ID,Date,Item,Supplier,Quantity,Purchase Price,Total Cost,Note");
    expect(csv).toContain("purchase-1");
    expect(csv).toContain("Vertex Supply");
    expect(prisma.purchase.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1" }
    }));
  });
});
