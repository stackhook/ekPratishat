"use client";
import { AddPropertyForm } from "@repo/components/addPropertyForm";
import { AddPropertySkeleton } from "@repo/components/addPropertySkeleton";
import { useCreateProperty, useGetUserInfo } from "@repo/query-hook";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { revalidateTagPathAction } from "../../../../actions/revalidateAction";


  const emptyState = {
        title: "",
        description: "",
        type: "sale" as 'rent' | 'sale',
        categoryId: "",
        districtId: "",
        municipalityId: "",
        price: "",
        noOfBedRooms: "",
        noOfRestRooms: "",
        landArea: "",
        noOfFloors: "",
        negotiable: false,
        features:null,
        propertyAge: "",
        facingDirection: "east",
        floorArea: "",
        roadSize: "",
        verified: false,
        locationId: "",
        floorLevel: "",
        tole: "",
        lat: null,
        lng: null,
        images: [],
        amenities:[]
    }


export default function AddProperty() {
  const { data: user, isLoading } = useGetUserInfo();
  console.log("User", user);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { mutate, isPending } = useCreateProperty();

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     const timer = setTimeout(() => {
  //       router.replace("/auth/signin");
  //     }, 1500);

  //     return () => clearTimeout(timer);
  //   }
  // }, [user, isLoading, router]);

  if (isLoading || !mounted) {
    return <div className="mx-auto max-w-7xl px-4 pb-12 pt-[calc(var(--site-nav-height)+2rem)]"><AddPropertySkeleton /></div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 animate-in fade-in duration-500 px-4 pt-[var(--site-nav-height)]">
        <div className="relative">
          {/* Outer Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gold-500/15 blur-xl" />

          {/* Icon Container */}
          <div className="relative rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-4 shadow-[var(--ek-shadow-card)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:shadow-[var(--ek-dark-shadow-card)]">
            <LockKeyhole className="h-10 w-10 text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
          </div>

          {/* Small Spinner positioned on the corner */}
          <div className="absolute -bottom-1 -right-1 rounded-full bg-[var(--ek-bg-card)] p-1 shadow-md dark:bg-[var(--ek-dark-page)]">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
            Authentication Required
          </h3>
          <p className="max-w-[250px] text-sm text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-muted)]">
            Please wait while we redirect you to the login page...
          </p>
        </div>
      </div>
    )
  }

  const role = user?.role;


  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-[calc(var(--site-nav-height)+2rem)] animate-in fade-in duration-500">
      <AddPropertyForm user={role} initialData={emptyState} isLoading={isPending} onSubmit={(data: FormData) => mutate(data, {
                onSuccess: async (data) => {
                    await revalidateTagPathAction({tag:[`listings-${user.id}`]})
                    toast.success(data.message || "Property added successfully!!!");
                    router.replace("/user/my-listings")
                }
            })}  />

    </div>

  )
}
