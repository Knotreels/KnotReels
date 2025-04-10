"use client";

import { useEffect, useRef, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, storage, db } from "@/firebase/config";
import Image from "next/image";

export default function ProfileImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (user?.photoURL) {
      setCurrentPhoto(user.photoURL);
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update Firebase Auth + Firestore
      await updateProfile(user, { photoURL });

      await updateDoc(doc(db, "users", user.uid), {
        photoURL,
      });

      setCurrentPhoto(photoURL);
    } catch (error) {
      console.error("Upload failed", error);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-blue-500 cursor-pointer hover:opacity-80 transition"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={preview || currentPhoto || "/creators/default-avatar.png"}
          alt="Profile"
          fill
          className="object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
            Uploading...
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-sm text-gray-400">Tap image to change your profile photo</p>
    </div>
  );
}