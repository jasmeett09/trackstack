const { prisma } = require("../config/prisma");
const { mapSupplier } = require("../utils/prismaSerializers");
const auditLogService = require("./auditLogService");
const { getTenantContext } = require("./tenantService");

const getAllSuppliers = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const suppliers = await prisma.supplier.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  });

  return suppliers.map(mapSupplier);
};

const getSupplierOptions = async (userId) => {
  const { organizationId } = await getTenantContext(userId);
  const suppliers = await prisma.supplier.findMany({
    where: { organizationId },
    orderBy: { name: "asc" }
  });

  return suppliers.map(mapSupplier);
};

const getSupplierById = async (id, userId) => {
  const { organizationId } = await getTenantContext(userId);
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      organizationId
    }
  });

  return mapSupplier(supplier);
};

const createSupplier = async (userId, data) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const supplier = await prisma.supplier.create({
    data: {
      organizationId,
      name: data.name.trim(),
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      address: data.address || null
    }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "supplier.created",
    entity: "Supplier",
    details: {
      supplierId: supplier.id,
      name: supplier.name
    }
  });

  return mapSupplier(supplier);
};

const updateSupplier = async (id, userId, data) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!supplier) {
    return null;
  }

  const updatedSupplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: data.name.trim(),
      contactPerson: data.contactPerson || null,
      phone: data.phone || null,
      address: data.address || null
    }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "supplier.updated",
    entity: "Supplier",
    details: {
      supplierId: updatedSupplier.id,
      previous: {
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        address: supplier.address
      },
      current: {
        name: updatedSupplier.name,
        contactPerson: updatedSupplier.contactPerson,
        phone: updatedSupplier.phone,
        address: updatedSupplier.address
      }
    }
  });

  return mapSupplier(updatedSupplier);
};

const deleteSupplier = async (id, userId) => {
  const { organizationId, userId: resolvedUserId } = await getTenantContext(userId);
  const supplier = await prisma.supplier.findFirst({
    where: {
      id,
      organizationId
    }
  });

  if (!supplier) {
    return null;
  }

  const deletedSupplier = await prisma.supplier.delete({
    where: { id }
  });

  await auditLogService.logActivity({
    organizationId,
    userId: resolvedUserId,
    action: "supplier.deleted",
    entity: "Supplier",
    details: {
      supplierId: deletedSupplier.id,
      name: deletedSupplier.name
    }
  });

  return mapSupplier(deletedSupplier);
};

const countSuppliers = async (userId) =>
  prisma.supplier.count({
    where: {
      organizationId: (await getTenantContext(userId)).organizationId
    }
  });

module.exports = {
  getAllSuppliers,
  getSupplierOptions,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  countSuppliers
};
