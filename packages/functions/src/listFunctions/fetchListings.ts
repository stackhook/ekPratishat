import { prisma } from "@repo/database";
import { AppError } from "../error.js";

type FetchListingProps = {
    page?: number;
    pageSize?: number;
}

export async function fetchListings({
    page = 1,
    pageSize = 10
}: FetchListingProps) {
    try {
        const skip = (page - 1) * pageSize;
        const [data, total] = await prisma.$transaction([
            prisma.property.findMany({
                skip,
                take: pageSize,
                orderBy: {
                    createdAt: "desc"
                },
                select: {
                    id:true,
                    title:true,
                    description:true,
                    type: true,
                    price: true,
                    tole: true,
                    verified:true,
                    isFeatured:true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    },
                    images: {
                        select: {
                            url: true
                        }
                    },
                    location: {
                        select: {
                            name: true,
                            municipality: {
                                select: {
                                    name: true,
                                    district: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                        
                    }
                }
            }),
            prisma.property.count()
        ]);
        return {
            data,
            status:200,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total/pageSize)
            }
        }

    }catch(e){
        throw new AppError(500, "Failed to fetch listings")
    }
}