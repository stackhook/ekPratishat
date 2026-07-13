import DynamicIcon from "@repo/components/DynamicIcon";
import { PropertyDetailClientProps } from "./PropertyDetailClient";
import {
  MapPinIcon,
  HomeIcon,
  ArrowsPointingOutIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CursorArrowRippleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import NotesCard from "@repo/components/notesCard";
import { getRoomLabels } from "../../utils/roomLabels";

export default function PropertyInfo({property}:PropertyDetailClientProps){
    const roomLabels = getRoomLabels(property.category?.name);
    const specifications = [
    { label: "Property Type", value: property.type || "Not specified", icon: HomeIcon },
    { label: "Category", value: property.category?.name || "Not specified", icon: BuildingOfficeIcon },
    { label: roomLabels.bedrooms, value: property.noOfBedRooms, icon: HomeIcon },
    { label: roomLabels.restrooms, value: property.noOfRestRooms, icon: HomeIcon },
    { label: "Land Area (sq. MTR)", value: property.landArea, icon: ArrowsPointingOutIcon },
    { label: "Floor Area (sq. ft.)", value: property.floorArea, icon: ArrowsPointingOutIcon },
    { label: "Number of Floors", value: property.noOfFloors, icon: BuildingOfficeIcon },
    { label: "Floor Level", value: property.floorLevel, icon: CursorArrowRippleIcon },
    { label: "Property Age (years)", value: property.propertyAge, icon: CalendarIcon },
    { label: "Facing Direction", value: property.facingDirection, icon: HomeIcon },
    { label: "Road Size (ft.)", value: property.roadSize, icon: ArrowsPointingOutIcon },
  ].filter((spec) => spec.value);
  // Hide specs with no value (empty/null), like the admin SpecItem does — but
  // keep "0" since it's meaningful (e.g. Property Age 0 = brand new, Floor Level 0 = ground).

   const formattedDate = new Date(property.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
              <h2 className="text-xl font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gold" />
                Description
              </h2>
              <p className="text-[var(--ek-text-secondary)] dark:text-[var(--ek-dark-muted)] leading-relaxed whitespace-break-spaces">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Specifications */}
            <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
              <h2 className="text-xl font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] mb-6">
                Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl bg-[var(--ek-bg-card-soft)] p-3 dark:bg-[var(--ek-dark-elevated)]"
                  >
                    <spec.icon className="w-5 h-5 text-gold mt-0.5" />
                    <div>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">
                        {spec.label}
                      </p>
                      <p className="text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] font-medium capitalize">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
                        {/* Amenities */}
                        {property.amenities.length > 0 && (
              <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
                <h2 className="text-xl font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] mb-6">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-4">
                  {property.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 rounded-xl bg-[var(--ek-bg-card-soft)] px-4 py-2 dark:bg-[var(--ek-dark-elevated)]">
                      <DynamicIcon name={amenity.icon} />
                      <span className="text-sm text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

                        {/* Features */}
                        {!!property.features && (
              <NotesCard
                notes={property.features}
                header="Property Features"
                subheader="Specific features of the property"
              />
            )}


          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 text-center shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold-gradient flex items-center justify-center">
                <span className="text-2xl font-bold text-[#151006]">A</span>
              </div>
              <h3 className="text-lg font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
                Verified By
              </h3>
              <p className="text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)] text-sm mt-1">
                Licensed Real Estate Professional
              </p>
              {/* <button className="w-full mt-4 py-2 rounded-lg bg-gold-gradient text-white font-medium hover:bg-gold-gradient-hover transition-colors">
                Contact via Email
              </button>
              <button className="w-full mt-2 py-2 rounded-lg border border-gold text-gold font-medium hover:bg-gold/10 transition-colors">
                Call Now
              </button> */}
            </div>

            {/* Location Info */}
            {property.location && (
              <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
                <h3 className="text-lg font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-gold" />
                  Location Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-secondary-500 dark:text-secondary-400">District:</span>
                    <p className="text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] font-medium">
                      {property.location.municipality.district.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-secondary-500 dark:text-secondary-400">Municipality:</span>
                    <p className="text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] font-medium">
                      {property.location.municipality.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-secondary-500 dark:text-secondary-400">Ward:</span>
                    <p className="text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] font-medium">
                      {property.location.name}
                    </p>
                  </div>
                  {property.tole && (
                    <div>
                      <span className="text-secondary-500 dark:text-secondary-400">Tole:</span>
                      <p className="text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] font-medium">
                        {property.tole}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posted Date */}
            <div className="rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-6 shadow-sm dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]">
              <h3 className="text-lg font-semibold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gold" />
                Posted On
              </h3>
              <p className="text-secondary-600 dark:text-secondary-300">{formattedDate}</p>
              <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-2">
                Property Code: EP-{property.propertyCode}
              </p>
            </div>
          </div>
        </div>
    </div>
  )
}
