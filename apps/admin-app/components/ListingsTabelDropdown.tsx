"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface Props {
  listings: any[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export default function PropertyTableDropdown({
  listings,
  meta,
  onPageChange,
}: Props) {
  const [openRow, setOpenRow] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm overflow-hidden">
      {/* TABLE */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full min-w-[1000px] divide-y divide-secondary-200 dark:divide-secondary-700">
          <thead className="bg-secondary-50 dark:bg-secondary-800 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Verified
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                Price
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
            {listings.map((property, index) => {
              const isOpen = openRow === property.id;

              return (
                <React.Fragment key={property.id}>
                  {/* MAIN ROW */}
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="hover:bg-secondary-50 dark:hover:bg-secondary-800"
                  >
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/admin/property/${property.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {property.title}
                      </Link>
                    </td>

                    <td className="px-6 py-4">
                      {property.category?.name}
                    </td>

                    <td className="px-6 py-4">
                      {property.verified ? <span className="bg-green-400 p-2 rounded-md text-black">Verfified</span> : <span className="bg-red-400 p-2 rounded-xl text-black">Not Verified</span>}
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      Rs. {property.price?.toLocaleString()}
                    </td>

                    {/* DROPDOWN BUTTON (ONLY ICON) */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          setOpenRow(isOpen ? null : property.id)
                        }
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-secondary-200 dark:hover:bg-secondary-700"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                    </td>
                  </motion.tr>

                  {/* DROPDOWN CONTENT */}
                  {isOpen && (
                    <tr className="bg-secondary-50 dark:bg-secondary-800">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-secondary-500">Type</p>
                            <p className="font-medium">{property.type}</p>
                          </div>
                          <div>
                            <p className="text-secondary-500">District</p>
                            <p className="font-medium">{property.location?.municipality?.district?.name}</p>
                          </div>

                          <div>
                            <p className="text-secondary-500">Tole</p>
                            <p className="font-medium">{property.tole}</p>
                          </div>

                          <div>
                            <p className="text-secondary-500">Posted By</p>
                            <p className="font-medium">
                              {property.user?.name}
                            </p>
                          </div>

                          <div>
                          <p className="text-secondary-500">Actions</p>
                            <div className="flex gap-3">
                              <Link
                                href={`/admin/property/${property.id}`}
                                className="text-primary-600 hover:underline"
                              >
                                View
                              </Link>
                              <Link
                                href={`/property/${property.id}/edit`}
                                className="text-secondary-600 hover:underline"
                              >
                                Edit
                              </Link>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex-shrink-0 px-6 py-4 border-t bg-secondary-50 dark:bg-secondary-800">
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-600">
            Page <strong>{meta.page}</strong> of{" "}
            <strong>{meta.totalPages}</strong> • {meta.total} listings
          </p>

          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => onPageChange(meta.page - 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={meta.page === meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
