"use client";

import { useCreateDesignation, useGetAllPermissions } from "@repo/query-hook";
import AnimateLoader from "@repo/ui/animateLoader";
import { useState } from "react";
import { toast } from "sonner";

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
}

type GroupedPermissions = Record<string, Permission[]>;

export default function CreateDesignation() {
  const { data: groupedPermissions, isLoading, isError, error } = useGetAllPermissions();
  const { mutate: createDesignation, isPending } = useCreateDesignation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [multipleAssignment, setMultipleAssignment] = useState<boolean>(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <AnimateLoader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error.message}
      </div>
    );
  }

  // Toggle single permission selection
  const handleTogglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((permId) => permId !== id) : [...prev, id]
    );
  };

  // Toggle all permissions inside a specific resource module
  const handleToggleResourceGroup = (permissions: Permission[]) => {
    const resourceIds = permissions.map((p) => p.id);
    const allSelected = resourceIds.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !resourceIds.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...resourceIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedPermissionIds.length === 0) return;
    console.log(multipleAssignment);

    createDesignation({
      title,
      description,
      permissionIds: selectedPermissionIds,
      multipleAssignment
    }, {
      onSuccess: (data) => {
        toast.success(data.message || "Operation Successful!!!");
        setTitle("");
        setDescription("");
        setSelectedPermissionIds([]);
        setMultipleAssignment(true);
      }
    });
  };

  const typedPermissions = (groupedPermissions || {}) as GroupedPermissions;

  return (
    <div className="max-w-7xl p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Create New Designation
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Designation Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Senior Lead Agent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Describe responsibilities or level of access..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Can it be assigned to multiple users? *
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="multipleAssignment"
                checked={multipleAssignment === true}
                onChange={() => setMultipleAssignment(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Yes</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="multipleAssignment"
                checked={multipleAssignment === false}
                onChange={() => setMultipleAssignment(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>No (Single User Only)</span>
            </label>
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Assign Permissions
          </h2>

          {Object.entries(typedPermissions).map(([resource, permissions]) => {
            const allSelected = permissions.every((p) =>
              selectedPermissionIds.includes(p.id)
            );

            return (
              <div
                key={resource}
                className="p-4 border rounded-lg dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
              >
                {/* Resource Header with Select All toggle */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b dark:border-gray-700">
                  <span className="font-bold capitalize text-gray-800 dark:text-gray-200">
                    {resource} Module
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleResourceGroup(permissions)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {/* Individual Permission Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {permissions.map((perm) => {
                    const isChecked = selectedPermissionIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer text-sm transition-colors ${isChecked
                            ? "bg-blue-50 border-blue-400 text-blue-900 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-200"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize font-mono text-xs">
                          {perm.action}:{perm.scope}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={isPending || selectedPermissionIds.length === 0}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Creating..." : "Save Designation"}
          </button>
        </div>
      </form>
    </div>
  );
}