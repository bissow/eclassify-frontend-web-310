"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const LandingHeader = dynamic(() => import("@/features/navigation/landing/LandingHeader"));
const HomeHeader = dynamic(() => import("@/features/navigation/home/HomeHeader"));

const Header = ({ cityData }) => {
  const pathname = usePathname();
  return pathname.endsWith("/landing") ? (
    <LandingHeader />
  ) : (
    <HomeHeader cityData={cityData} />
  );
};

export default Header;
