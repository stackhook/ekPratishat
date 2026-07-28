// src/config/permissions.js
export const PERMISSIONS = [
  // --- Leads ---
  {
    resource: "leads",
    action: "create",
    scope: "all",
    description: "Create new leads",
  },
  {
    resource: "leads",
    action: "read",
    scope: "own",
    description: "View assigned leads only",
  },
  {
    resource: "leads",
    action: "read",
    scope: "all",
    description: "View all company leads",
  },
  {
    resource: "leads",
    action: "update",
    scope: "own",
    description: "Edit assigned leads",
  },
  {
    resource: "leads",
    action: "update",
    scope: "all",
    description: "Edit any lead",
  },
  {
    resource: "leads",
    action: "delete",
    scope: "all",
    description: "Delete leads",
  },

  // --- Properties ---
  {
    resource: "properties",
    action: "create",
    scope: "all",
    description: "Add new properties",
  },
  {
    resource: "properties",
    action: "read",
    scope: "all",
    description: "View all listings",
  },
  {
    resource: "leads",
    action: "read",
    scope: "own",
    description: "View managed properties only",
  },
  {
    resource: "properties",
    action: "update",
    scope: "own",
    description: "Edit owned listings",
  },
  {
    resource: "properties",
    action: "update",
    scope: "all",
    description: "Edit any listing",
  },
  {
    resource: "properties",
    action: "delete",
    scope: "all",
    description: "Delete properties",
  },

  // --- Future Modules (Just add items here when building new features) ---
  // { resource: 'deals', action: 'read', scope: 'own', description: 'View owned deals' },
];
