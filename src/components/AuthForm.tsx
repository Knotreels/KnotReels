"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth, db } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// 🔐 Schema - updated to require username for signup
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2, "Username is required").optional(),
});

type FormData = z.infer<typeof schema>;

interface AuthFormProps {
  type: "signup" | "login";
  redirectTo?: string | null;
}

export default function AuthForm({ type, redirectTo }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setFirebaseError("");

    try {
      if (type === "signup") {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await setDoc(doc(db, "users", userCred.user.uid), {
          email: data.email,
          username: data.username || "",
          avatar: "",
          boosts: 0,
          tips: 0,
          views: 0,
          hasPaid: false,
          trialActive: true,
          trialStartedAt: serverTimestamp(),
          role: "Creator",
          createdAt: serverTimestamp(),
        });

        alert("✅ Account created!");
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }

      // ✅ Redirect logic
      if (redirectTo === "subscribe") {
        router.push("/subscribe");
      } else {
        router.push("/dashboard/browse");
      }
    } catch (err: any) {
      setFirebaseError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      {type === "signup" && (
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" {...register("username")} />
          {errors.username && <p>{errors.username.message}</p>}
        </div>
      )}

      {firebaseError && <p>{firebaseError}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : type === "signup" ? "Sign Up" : "Log In"}
      </Button>
    </form>
  );
}
