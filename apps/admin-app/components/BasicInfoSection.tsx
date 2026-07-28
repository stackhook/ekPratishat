import { AgentDetailType } from "@repo/validators";
import Image from "next/image";
import VerifyBadge from "./VerifyBadge";
import { Check, ShieldAlert } from "lucide-react";

export default function BasicInfoSection({ agent }: { agent: AgentDetailType }) {
    return (
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-14">
            {/* Profile Image - Clean without tick */}
            <div className="flex-shrink-0">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-primary-500 dark:border-primary-dark-500">
                    {agent.profileImageUrl ? (
                        <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}${agent.profileImageUrl}`}
                            alt={agent.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-secondary-200 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-300 text-sm sm:text-base">
                            No Image
                        </div>
                    )}
                </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-2 text-sm sm:text-base md:text-base lg:text-lg">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-500">
                        {agent.name}
                    </h1>
                    {/* Keep verification badge next to name only */}
                    {agent.isVerified && (
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full" title="Verified Agent">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </div>
                <p className="text-secondary-600 dark:text-secondary-300">Email: {agent.email}</p>
                <p className="text-secondary-600 dark:text-secondary-300">Contact: {agent.contact}</p>
                {
                    agent?.designation?.title && <p className="text-secondary-600 dark:text-secondary-300">Designation: <span className="font-bold text-blue-600">{agent?.designation?.title}</span></p>
                }

                {/* <p className="text-secondary-600 dark:text-secondary-300">
                    Role: {agent.role?.toUpperCase() || "Unknown"}
                </p> */}
                {/* Dynamic Role Badge */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                        Role:
                    </span>
                    <span
                        className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border
            ${agent.role === "staff"
                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50"
                                : agent.role === "partner"
                                    ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50"
                                    : agent.role === "client"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
                                        : "bg-secondary-50 text-secondary-700 border-secondary-200 dark:bg-secondary-800 dark:text-secondary-300 dark:border-secondary-700"
                            }
        `}
                    >
                        {/* Subtle inner dot indicator */}
                        <span
                            className={`w-1.5 h-1.5 mr-1.5 rounded-full ${agent.role === "staff" ? "bg-blue-500" :
                                    agent.role === "partner" ? "bg-purple-500" :
                                        agent.role === "client" ? "bg-emerald-500" : "bg-secondary-400"
                                }`}
                        />
                        {agent.role || "Unknown"}
                    </span>
                </div>
                {
                    agent.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-dark-500 dark:text-primary-200">
                            <Check className="w-3 h-3" strokeWidth={3} />
                            Verified
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 hover:bg-red-200 transition">
                            <ShieldAlert className="w-3 h-3" strokeWidth={3} />
                            Not verified
                        </span>
                    )
                }
            </div>
        </div>
    )
}