import Link from "next/link";
import { Categories } from "../../components/category/Categories";
import HeroSection from "../../components/HeroSection";
import { HomePageFeaturedProperties } from "../../components/properties/HomePageFeaturedProperties";
import RecentListings from "../../components/properties/RecentListings";
import TestSessionExpiry from "../../components/Test-Expiry";



export default async function Home(){
  return <div>
    <HeroSection/>
    <HomePageFeaturedProperties/>
      <Link
        href="/user/add-property"
        prefetch={false}
        onClick={() => {
          console.log("🔥 TEST LINK CLICK");
        }}
      >
        TEST ADD PROPERTY
      </Link>
    <Categories/>
    <RecentListings/>
    {/* <TestSessionExpiry/> */}

   
  </div>
}