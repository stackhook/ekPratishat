"use client";

import { useGetAllDesignations } from "@repo/query-hook";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Shield, Lock } from "lucide-react";

// Helper type definitions for readability
interface Permission {
  id: string;
  resource: string; // e.g. "leads", "properties"
  action: string;   // e.g. "create", "read", "update"
  scope: string;    // e.g. "own", "all"
}

interface DesignationPermission {
  designationId: string;
  permissionId: string;
  permission: Permission;
}

interface Designation {
  id: string;
  title: string;
  description: string;
  multipleAssignment: boolean;
  permissions: DesignationPermission[];
}

export default function DesignationPage() {
  const router = useRouter();
  const { data: designations, isLoading, isError, error } = useGetAllDesignations(true);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse">Loading designations...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        Error loading designations: {error?.message || "Something went wrong"}
      </div>
    );
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the "${title}" designation?`)) {
      // TODO: Trigger your delete mutation hook here
      console.log("Delete designation ID:", id);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Designations & Permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user roles, assigned system capabilities, and resource access scopes.
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/users/designation/create")}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Designation
        </button>
      </div>

      {/* Designation Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {designations?.map((designation: Designation) => {
          // Group permissions by resource module (e.g. { leads: [...], properties: [...] })
          const groupedPermissions = designation.permissions?.reduce(
            (acc, item) => {
              const res = item.permission.resource;
              if (!acc[res]) acc[res] = [];
              acc[res].push(item.permission);
              return acc;
            },
            {} as Record<string, Permission[]>
          );

          return (
            <div
              key={designation.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {designation.title}
                    </h2>
                    {designation.multipleAssignment && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                        Multiple Users Allowed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{designation?.description}</p>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => router.push(`/admin/users/designation/edit?id=${designation.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(designation.id, designation.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Card Body - Permissions List Grouped by Module */}
              <div className="p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Assigned Module Permissions
                </h3>

                {groupedPermissions && Object.keys(groupedPermissions).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                      <div
                        key={moduleName}
                        className="p-3 rounded-lg border border-gray-100 bg-gray-50/30 space-y-2"
                      >
                        {/* Module Name Header */}
                        <div className="font-semibold text-xs text-gray-700 capitalize border-b border-gray-200/60 pb-1">
                          {moduleName} Module
                        </div>

                        {/* Badges for actions under this module */}
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-mono shadow-2xs"
                            >
                              <span className="font-medium text-indigo-600">{p.action}</span>
                              <span className="text-gray-400 text-[10px]">:</span>
                              <span
                                className={`text-[10px] font-semibold uppercase ${
                                  p.scope === "all" ? "text-emerald-600" : "text-amber-600"
                                }`}
                              >
                                {p.scope}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No permissions assigned to this designation.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}