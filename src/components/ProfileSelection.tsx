"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { PROFILE_IMAGES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface Profile {
  id: number;
  name: string;
  image: string;
  isKids?: boolean;
}

const PROFILES: Profile[] = [
  { id: 1, name: "User 1", image: PROFILE_IMAGES[0] },
  { id: 2, name: "User 2", image: PROFILE_IMAGES[1] },
  { id: 3, name: "User 3", image: PROFILE_IMAGES[2] },
  { id: 4, name: "Kids", image: PROFILE_IMAGES[3], isKids: true },
];

export default function ProfileSelection() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const handleProfileSelect = (profile: Profile) => {
    if (isEditing) return;
    router.push("/browse");
  };

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <h1 className="text-white text-3xl md:text-5xl font-bold mb-10">
        {isEditing ? "Manage Profiles" : "Who's watching?"}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
        {PROFILES.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleProfileSelect(profile)}
            className="cursor-pointer group text-center"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-white transition">
              <Image
                src={profile.image}
                alt={profile.name}
                fill
                className="object-cover"
              />

              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Pencil size={36} className="text-white" />
                </div>
              )}
            </div>
            <p className="mt-2 text-white font-medium">
              {profile.name}
              {profile.isKids && (
                <span className="block text-xs text-blue-400">Kids</span>
              )}
            </p>
          </div>
        ))}

        {!isEditing && (
          <div
            onClick={() => router.push("/add-profile")}
            className="cursor-pointer group text-center"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto flex items-center justify-center rounded-full border-2 border-dashed border-gray-500 group-hover:border-white transition">
              <div className="text-4xl text-gray-400 group-hover:text-white">+</div>
            </div>
            <p className="mt-2 text-gray-400 group-hover:text-white">Add Profile</p>
          </div>
        )}
      </div>

      <Button
        variant={isEditing ? "default" : "outline"}
        className={`${
          isEditing
            ? "bg-white text-black hover:bg-white/90"
            : "border-gray-400 text-gray-400 hover:border-white hover:text-white"
        }`}
        onClick={() => setIsEditing(!isEditing)}
      >
        {isEditing ? "Done" : "Manage Profiles"}
      </Button>
    </div>
  );
}
