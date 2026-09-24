import { Categories } from "../../components/category/Categories";
import HeroSection from "../../components/HeroSection";
import { HomePageFeaturedProperties } from "../../components/properties/HomePageFeaturedProperties";
import RecentListings from "../../components/properties/RecentListings";
import TestSessionExpiry from "../../components/Test-Expiry";



export default async function Home(){
  return <div>
    <HeroSection/>
    <HomePageFeaturedProperties/>
    <Categories/>
    <RecentListings/>
    {/* <TestSessionExpiry/> */}

   
  </div>
}