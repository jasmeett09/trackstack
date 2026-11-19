const makeBearerSecurity = () => [{ bearerAuth: [] }, { sessionAuth: [] }];

const schemaRefs = {
  authRegisterRequest: {
    type: "object",
    required: ["organizationName", "name", "email", "password", "confirmPassword"],
    properties: {
      organizationName: { type: "string", example: "Acme Traders" },
      name: { type: "string", example: "Asha Admin" },
      email: { type: "string", format: "email", example: "admin@acme.com" },
      password: { type: "string", format: "password", example: "secret123" },
      confirmPassword: { type: "string", format: "password", example: "secret123" }
    }
  },
  loginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "admin@acme.com" },
      password: { type: "string", format: "password", example: "secret123" }
    }
  },
  invitationAcceptRequest: {
    type: "object",
    required: ["invitationId", "name", "email", "password", "confirmPassword"],
    properties: {
      invitationId: { type: "string", example: "cm_invite_123" },
      name: { type: "string", example: "Mina Manager" },
      email: { type: "string", format: "email", example: "manager@acme.com" },
      password: { type: "string", format: "password", example: "secret123" },
      confirmPassword: { type: "string", format: "password", example: "secret123" }
    }
  },
  invitationCreateRequest: {
    type: "object",
    required: ["email", "role"],
    properties: {
      email: { type: "string", format: "email", example: "staff@acme.com" },
      role: { type: "string", enum: ["manager", "staff"], example: "staff" }
    }
  },
  roleUpdateRequest: {
    type: "object",
    required: ["role"],
    properties: {
      role: { type: "string", enum: ["admin", "manager", "staff"], example: "manager" }
    }
  },
  categoryCreateRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Electronics" },
      description: { type: "string", example: "Devices and accessories" }
    }
  },
  supplierCreateRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", example: "Vertex Supply Co." },
      contactPerson: { type: "string", example: "Rahul Sharma" },
      phone: { type: "string", example: "+91-9876543210" },
      address: { type: "string", example: "Industrial Area, Chandigarh" }
    }
  },
  itemCreateRequest: {
    type: "object",
    required: ["name", "quantity", "unit", "price"],
    properties: {
      name: { type: "string", example: "Laptop" },
      categoryId: { type: "string", example: "cat_123" },
      supplierId: { type: "string", example: "sup_123" },
      quantity: { type: "integer", example: 20 },
      unit: { type: "string", example: "pcs" },
      price: { type: "number", example: 79999 },
      description: { type: "string", example: "Business laptops for office inventory" },
      image: { type: "string", format: "binary" }
    }
  },
  purchaseCreateRequest: {
    type: "object",
    required: ["itemId", "supplierId", "quantity", "purchasePrice"],
    properties: {
      itemId: { type: "string", example: "item_123" },
      supplierId: { type: "string", example: "sup_123" },
      quantity: { type: "integer", example: 15 },
      purchasePrice: { type: "number", example: 62000 },
      note: { type: "string", example: "May restocking batch" }
    }
  },
  saleCreateRequest: {
    type: "object",
    required: ["itemId", "quantity", "sellingPrice"],
    properties: {
      itemId: { type: "string", example: "item_123" },
      quantity: { type: "integer", example: 3 },
      sellingPrice: { type: "number", example: 85000 },
      customerName: { type: "string", example: "Orbit Solutions" },
      note: { type: "string", example: "Urgent dispatch order" }
    }
  },
  transactionCreateRequest: {
    type: "object",
    required: ["itemId", "transactionType", "quantity"],
    properties: {
      itemId: { type: "string", example: "item_123" },
      transactionType: { type: "string", enum: ["stock-in", "stock-out"], example: "stock-out" },
      quantity: { type: "integer", example: 4 },
      note: { type: "string", example: "Manual stock adjustment" }
    }
  },
  userSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "user_123" },
      name: { type: "string", example: "Asha Admin" },
      email: { type: "string", format: "email", example: "admin@acme.com" },
      role: { type: "string", example: "admin" },
      organizationId: { type: "string", example: "org_123" },
      organizationName: { type: "string", example: "Acme Traders" }
    }
  },
  organizationSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "org_123" },
      organizationName: { type: "string", example: "Acme Traders" },
      memberCount: { type: "integer", example: 6 },
      createdAt: { type: "string", format: "date-time" },
      createdBy: { type: "string", example: "user_123" }
    }
  },
  invitationSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "invite_123" },
      email: { type: "string", format: "email", example: "staff@acme.com" },
      role: { type: "string", example: "staff" },
      status: { type: "string", example: "pending" },
      organizationId: { type: "string", example: "org_123" },
      organizationName: { type: "string", example: "Acme Traders" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  categorySummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "cat_123" },
      _id: { type: "string", example: "cat_123" },
      name: { type: "string", example: "Electronics" },
      description: { type: "string", example: "Devices and accessories" }
    }
  },
  supplierSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "sup_123" },
      _id: { type: "string", example: "sup_123" },
      name: { type: "string", example: "Vertex Supply Co." },
      contactPerson: { type: "string", example: "Rahul Sharma" },
      phone: { type: "string", example: "+91-9876543210" }
    }
  },
  itemSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "item_123" },
      _id: { type: "string", example: "item_123" },
      name: { type: "string", example: "Laptop" },
      quantity: { type: "integer", example: 20 },
      reorderLevel: { type: "integer", example: 10 },
      unit: { type: "string", example: "pcs" },
      price: { type: "number", example: 79999 },
      imageUrl: { type: "string", example: "https://res.cloudinary.com/demo/image/upload/sample.jpg" }
    }
  },
  auditActivity: {
    type: "object",
    properties: {
      id: { type: "string", example: "log_123" },
      action: { type: "string", example: "organization.updated_user_role" },
      entity: { type: "string", example: "User" },
      details: { type: "object", additionalProperties: true },
      timestamp: { type: "string", format: "date-time" }
    }
  },
  inventoryAudit: {
    type: "object",
    properties: {
      id: { type: "string", example: "invlog_123" },
      itemId: { type: "string", example: "item_123" },
      userId: { type: "string", example: "user_123" },
      action: { type: "string", example: "sale.created" },
      oldQuantity: { type: "integer", example: 12 },
      newQuantity: { type: "integer", example: 8 },
      metadata: { type: "object", additionalProperties: true },
      timestamp: { type: "string", format: "date-time" }
    }
  },
  notificationSummary: {
    type: "object",
    properties: {
      id: { type: "string", example: "notif_123" },
      _id: { type: "string", example: "notif_123" },
      type: { type: "string", example: "inventory.low_stock" },
      title: { type: "string", example: "Low stock alert" },
      message: { type: "string", example: "Laptop dropped below the low-stock threshold of 10." },
      entity: { type: "string", example: "Item" },
      entityId: { type: "string", example: "item_123" },
      metadata: { type: "object", additionalProperties: true },
      createdAt: { type: "string", format: "date-time" },
      isRead: { type: "boolean", example: false }
    }
  }
};

const createJsonRequest = (schemaName) => ({
  required: true,
  content: {
    "application/json": {
      schema: { $ref: `#/components/schemas/${schemaName}` }
    }
  }
});

const createMultipartRequest = (schemaName) => ({
  required: true,
  content: {
    "multipart/form-data": {
      schema: { $ref: `#/components/schemas/${schemaName}` }
    }
  }
});

const okArray = (schemaName, description) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: { $ref: `#/components/schemas/${schemaName}` }
      }
    }
  }
});

const okObject = (schemaName, description, key = null) => ({
  description,
  content: {
    "application/json": {
      schema: key
        ? {
            type: "object",
            properties: {
              [key]: { $ref: `#/components/schemas/${schemaName}` }
            }
          }
        : { $ref: `#/components/schemas/${schemaName}` }
    }
  }
});

const commonResponses = {
  Unauthorized: {
    description: "Authentication is required or session/token is invalid."
  },
  Forbidden: {
    description: "The authenticated user does not have permission for this action."
  },
  ValidationError: {
    description: "Request validation failed."
  }
};

const groupedEndpoints = [
  {
    title: "Authentication",
    description: "Create a new organization, log in, accept staff invites, and restore the current session.",
    items: [
      { method: "POST", path: "/api/auth/register", summary: "Create organization and first admin" },
      { method: "POST", path: "/api/auth/login", summary: "Log in with email and password" },
      { method: "POST", path: "/api/auth/logout", summary: "Log out the active session" },
      { method: "GET", path: "/api/session/profile", summary: "Fetch the current logged-in user" },
      { method: "GET", path: "/api/auth/invitations/{invitationId}", summary: "Read invitation details before signup" },
      { method: "POST", path: "/api/auth/accept-invitation", summary: "Join an organization from an invite" },
      { method: "GET", path: "/api/profile", summary: "JWT-protected profile example" }
    ]
  },
  {
    title: "Organization",
    description: "Admin and manager endpoints for tenant-aware workspace management, invites, and audit history.",
    items: [
      { method: "GET", path: "/api/organization", summary: "Get organization summary" },
      { method: "GET", path: "/api/organization/users", summary: "List organization members (admin)" },
      { method: "PUT", path: "/api/organization/users/{userId}/role", summary: "Update a member role (admin)" },
      { method: "DELETE", path: "/api/organization/users/{userId}", summary: "Remove a member from the org (admin)" },
      { method: "GET", path: "/api/organization/invitations", summary: "List invitations (admin)" },
      { method: "POST", path: "/api/organization/invitations", summary: "Create an invitation (admin)" },
      { method: "DELETE", path: "/api/organization/invitations/{invitationId}", summary: "Revoke a pending invitation (admin)" },
      { method: "GET", path: "/api/organization/activity", summary: "Read org activity logs" },
      { method: "GET", path: "/api/organization/inventory-logs", summary: "Read org inventory audit trail" }
    ]
  },
  {
    title: "Notifications",
    description: "Organization-scoped in-app notifications with per-user read status.",
    items: [
      { method: "GET", path: "/api/notifications", summary: "List organization notifications" },
      { method: "PATCH", path: "/api/notifications/{notificationId}/read", summary: "Mark a notification as read" },
      { method: "PATCH", path: "/api/notifications/read-all", summary: "Mark all notifications as read" }
    ]
  },
  {
    title: "Reports",
    description: "Download organization-scoped PDF and CSV exports for reporting and submissions.",
    items: [
      { method: "GET", path: "/api/reports/export/inventory-pdf", summary: "Export inventory report as PDF" },
      { method: "GET", path: "/api/reports/export/sales-csv", summary: "Export sales report as CSV" },
      { method: "GET", path: "/api/reports/export/purchases-csv", summary: "Export purchases report as CSV" }
    ]
  },
  {
    title: "Inventory Domain",
    description: "Tenant-isolated inventory, category, supplier, purchase, sale, and analytics endpoints.",
    items: [
      { method: "GET", path: "/api/items", summary: "List organization items" },
      { method: "POST", path: "/api/items", summary: "Create a new inventory item" },
      { method: "PUT", path: "/api/items/{id}", summary: "Update an inventory item" },
      { method: "DELETE", path: "/api/items/{id}", summary: "Delete an inventory item (admin)" },
      { method: "GET", path: "/api/categories", summary: "List categories" },
      { method: "POST", path: "/api/categories", summary: "Create category" },
      { method: "GET", path: "/api/suppliers", summary: "List suppliers" },
      { method: "POST", path: "/api/suppliers", summary: "Create supplier" },
      { method: "GET", path: "/api/purchases", summary: "List purchases" },
      { method: "POST", path: "/api/purchases", summary: "Create purchase" },
      { method: "GET", path: "/api/sales", summary: "List sales" },
      { method: "POST", path: "/api/sales", summary: "Create sale" },
      { method: "GET", path: "/api/transactions", summary: "List stock transactions" },
      { method: "POST", path: "/api/transactions", summary: "Create stock transaction" },
      { method: "GET", path: "/api/analytics/dashboard", summary: "Get dashboard analytics" }
    ]
  }
];

const buildOpenApiSpec = (baseUrl = "http://localhost:5000") => ({
  openapi: "3.0.3",
  info: {
    title: "Inventory Management System API",
    version: "1.0.0",
    description:
      "Multi-tenant inventory platform with PostgreSQL-backed organizations and users, MongoDB audit trails, Cloudinary uploads, and role-based access control."
  },
  servers: [{ url: baseUrl }],
  tags: [
    { name: "Auth", description: "Signup, login, session, JWT, and invitation acceptance" },
    { name: "Organization", description: "Multi-tenant organization, users, invites, and audit logs" },
    { name: "Inventory", description: "Items, categories, suppliers, purchases, sales, and analytics" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      },
      sessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid"
      }
    },
    schemas: schemaRefs
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create organization and first admin",
        requestBody: createJsonRequest("authRegisterRequest"),
        responses: {
          201: okObject("userSummary", "Organization created successfully.", "user"),
          409: { description: "Email or organization name already exists." },
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: createJsonRequest("loginRequest"),
        responses: {
          200: okObject("userSummary", "Login successful.", "user"),
          401: { description: "Invalid credentials." },
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout active session",
        security: makeBearerSecurity(),
        responses: {
          200: { description: "Logout successful." },
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/session/profile": {
      get: {
        tags: ["Auth"],
        summary: "Fetch current session profile",
        security: makeBearerSecurity(),
        responses: {
          200: okObject("userSummary", "Current session profile.", "user"),
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/auth/invitations/{invitationId}": {
      get: {
        tags: ["Auth"],
        summary: "Get public invitation details",
        parameters: [
          {
            in: "path",
            name: "invitationId",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: okObject("invitationSummary", "Invitation details.", "invitation"),
          404: { description: "Invitation not found." },
          410: { description: "Invitation is no longer active." }
        }
      }
    },
    "/api/auth/accept-invitation": {
      post: {
        tags: ["Auth"],
        summary: "Accept invitation and join organization",
        requestBody: createJsonRequest("invitationAcceptRequest"),
        responses: {
          201: okObject("userSummary", "Invitation accepted.", "user"),
          404: { description: "Invitation not found or already used." },
          409: { description: "A user with this email already exists." },
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/profile": {
      get: {
        tags: ["Auth"],
        summary: "JWT-protected profile example",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Protected profile data." },
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/organization": {
      get: {
        tags: ["Organization"],
        summary: "Get organization summary",
        security: makeBearerSecurity(),
        responses: {
          200: okObject("organizationSummary", "Organization summary.", "organization"),
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/organization/users": {
      get: {
        tags: ["Organization"],
        summary: "List organization users",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("userSummary", "Organization members."),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    },
    "/api/organization/users/{userId}/role": {
      put: {
        tags: ["Organization"],
        summary: "Update a member role",
        security: makeBearerSecurity(),
        parameters: [
          { in: "path", name: "userId", required: true, schema: { type: "string" } }
        ],
        requestBody: createJsonRequest("roleUpdateRequest"),
        responses: {
          200: okObject("userSummary", "User role updated.", "user"),
          400: { description: "Guardrail blocked the role change." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          404: { description: "Organization user not found." }
        }
      }
    },
    "/api/organization/users/{userId}": {
      delete: {
        tags: ["Organization"],
        summary: "Remove a member from the organization",
        security: makeBearerSecurity(),
        parameters: [
          { in: "path", name: "userId", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "User removed successfully." },
          400: { description: "Guardrail blocked the removal." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          404: { description: "Organization user not found." }
        }
      }
    },
    "/api/organization/invitations": {
      get: {
        tags: ["Organization"],
        summary: "List organization invitations",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("invitationSummary", "Organization invitations."),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      },
      post: {
        tags: ["Organization"],
        summary: "Create organization invitation",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("invitationCreateRequest"),
        responses: {
          201: { description: "Invitation created successfully." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          409: { description: "User or pending invite already exists." },
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/organization/invitations/{invitationId}": {
      delete: {
        tags: ["Organization"],
        summary: "Revoke pending invitation",
        security: makeBearerSecurity(),
        parameters: [
          { in: "path", name: "invitationId", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Invitation revoked successfully." },
          400: { description: "Only pending invitations can be revoked." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          404: { description: "Invitation not found." }
        }
      }
    },
    "/api/organization/activity": {
      get: {
        tags: ["Organization"],
        summary: "Read organization activity logs",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("auditActivity", "Organization activity logs."),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    },
    "/api/organization/inventory-logs": {
      get: {
        tags: ["Organization"],
        summary: "Read inventory audit trail",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("inventoryAudit", "Organization inventory audit logs."),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    },
    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List organization notifications",
        security: makeBearerSecurity(),
        parameters: [
          { in: "query", name: "limit", required: false, schema: { type: "integer", example: 10 } },
          { in: "query", name: "unread", required: false, schema: { type: "boolean", example: false } }
        ],
        responses: {
          200: {
            description: "Notifications with unread count.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    notifications: {
                      type: "array",
                      items: { $ref: "#/components/schemas/notificationSummary" }
                    },
                    unreadCount: { type: "integer", example: 4 }
                  }
                }
              }
            }
          },
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/notifications/{notificationId}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark a single notification as read",
        security: makeBearerSecurity(),
        parameters: [{ in: "path", name: "notificationId", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Notification marked as read.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Notification marked as read." },
                    notification: { $ref: "#/components/schemas/notificationSummary" },
                    unreadCount: { type: "integer", example: 3 },
                    userId: { type: "string", example: "user_123" }
                  }
                }
              }
            }
          },
          401: commonResponses.Unauthorized,
          404: { description: "Notification not found." }
        }
      }
    },
    "/api/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: makeBearerSecurity(),
        responses: {
          200: {
            description: "All notifications marked as read.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "All notifications marked as read." },
                    unreadCount: { type: "integer", example: 0 },
                    userId: { type: "string", example: "user_123" }
                  }
                }
              }
            }
          },
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/items": {
      get: {
        tags: ["Inventory"],
        summary: "List tenant items",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("itemSummary", "Tenant items."),
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create inventory item",
        security: makeBearerSecurity(),
        requestBody: createMultipartRequest("itemCreateRequest"),
        responses: {
          201: okObject("itemSummary", "Item created successfully.", "item"),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/items/{id}": {
      get: {
        tags: ["Inventory"],
        summary: "Get item details",
        security: makeBearerSecurity(),
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: okObject("itemSummary", "Item details."),
          401: commonResponses.Unauthorized,
          404: { description: "Item not found." }
        }
      },
      put: {
        tags: ["Inventory"],
        summary: "Update inventory item",
        security: makeBearerSecurity(),
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: createMultipartRequest("itemCreateRequest"),
        responses: {
          200: okObject("itemSummary", "Item updated successfully.", "item"),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          404: { description: "Item not found." },
          422: commonResponses.ValidationError
        }
      },
      delete: {
        tags: ["Inventory"],
        summary: "Delete inventory item",
        security: makeBearerSecurity(),
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Item deleted successfully." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          404: { description: "Item not found." }
        }
      }
    },
    "/api/categories": {
      get: {
        tags: ["Inventory"],
        summary: "List categories",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("categorySummary", "Organization categories."),
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create category",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("categoryCreateRequest"),
        responses: {
          201: okObject("categorySummary", "Category created successfully.", "category"),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          409: { description: "Duplicate category for this organization." },
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/suppliers": {
      get: {
        tags: ["Inventory"],
        summary: "List suppliers",
        security: makeBearerSecurity(),
        responses: {
          200: okArray("supplierSummary", "Organization suppliers."),
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create supplier",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("supplierCreateRequest"),
        responses: {
          201: okObject("supplierSummary", "Supplier created successfully.", "supplier"),
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/purchases": {
      get: {
        tags: ["Inventory"],
        summary: "List purchases",
        security: makeBearerSecurity(),
        responses: {
          200: { description: "Organization purchases." },
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create purchase and increase stock",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("purchaseCreateRequest"),
        responses: {
          201: { description: "Purchase created successfully." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/sales": {
      get: {
        tags: ["Inventory"],
        summary: "List sales",
        security: makeBearerSecurity(),
        responses: {
          200: { description: "Organization sales." },
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create sale and decrease stock",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("saleCreateRequest"),
        responses: {
          201: { description: "Sale created successfully." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/transactions": {
      get: {
        tags: ["Inventory"],
        summary: "List stock transactions",
        security: makeBearerSecurity(),
        responses: {
          200: { description: "Organization stock transactions." },
          401: commonResponses.Unauthorized
        }
      },
      post: {
        tags: ["Inventory"],
        summary: "Create stock transaction",
        security: makeBearerSecurity(),
        requestBody: createJsonRequest("transactionCreateRequest"),
        responses: {
          201: { description: "Transaction created successfully." },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden,
          422: commonResponses.ValidationError
        }
      }
    },
    "/api/analytics/dashboard": {
      get: {
        tags: ["Inventory"],
        summary: "Get dashboard analytics",
        security: makeBearerSecurity(),
        responses: {
          200: { description: "Analytics dashboard payload." },
          401: commonResponses.Unauthorized
        }
      }
    },
    "/api/reports/export/inventory-pdf": {
      get: {
        tags: ["Reports"],
        summary: "Export organization inventory report as PDF",
        security: makeBearerSecurity(),
        responses: {
          200: {
            description: "PDF inventory report download.",
            content: {
              "application/pdf": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    },
    "/api/reports/export/sales-csv": {
      get: {
        tags: ["Reports"],
        summary: "Export organization sales report as CSV",
        security: makeBearerSecurity(),
        responses: {
          200: {
            description: "CSV sales report download.",
            content: {
              "text/csv": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    },
    "/api/reports/export/purchases-csv": {
      get: {
        tags: ["Reports"],
        summary: "Export organization purchases report as CSV",
        security: makeBearerSecurity(),
        responses: {
          200: {
            description: "CSV purchases report download.",
            content: {
              "text/csv": {
                schema: {
                  type: "string",
                  format: "binary"
                }
              }
            }
          },
          401: commonResponses.Unauthorized,
          403: commonResponses.Forbidden
        }
      }
    }
  }
});

module.exports = {
  buildOpenApiSpec,
  groupedEndpoints
};
