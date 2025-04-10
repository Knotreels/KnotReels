import {
    FaUser,
    FaHome,
    FaDiscord,
    FaVideo,
    FaUsers,
    FaChalkboardTeacher,
    FaImages,
  } from "react-icons/fa";
  
  export interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    external?: boolean;
  }
  
  export const navItems: NavItem[] = [
    { label: "Profile", icon: FaUser, href: "/dashboard/profiles" },
    { label: "Explore", icon: FaHome, href: "/dashboard/browse" },
    {
      label: "KnotReels Discord",
      icon: FaDiscord,
      href: "https://discord.com/",
      external: true,
    },
    {
      label: "Runway",
      icon: FaVideo,
      href: "https://runwayml.com/",
      external: true,
    },
    {
      label: "Kling AI",
      icon: FaUsers,
      href: "https://klingai.com/globalv2",
      external: true,
    },
    {
      label: "Hailoui",
      icon: FaUsers,
      href: "https://hailuoa1.video",
      external: true,
    },
    {
      label: "AI Classes",
      icon: FaChalkboardTeacher,
      href: "/dashboard/classes",
    },
    {
      label: "Clips",
      icon: FaVideo,
      href: "/dashboard/clips",
    },
    {
      label: "Gallery",
      icon: FaImages,
      href: "/dashboard/gallery",
    },
  ];