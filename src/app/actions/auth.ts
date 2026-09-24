"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  registerUser,
  authenticateUser,
  changePassword,
  AuthError,
} from "@/services/auth-service";
import { getSessionUser, setSessionCookie, getClientIp, logoutUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function registerAction(
  prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const rl = rateLimit("auth:register", ip);
  if (!rl.allowed) {
    return {
      error: `Too many attempts. Please try again in ${rl.retryAfterSeconds}s.`,
    };
  }

  const input = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  let token: string | undefined;
  try {
    const res = await registerUser(input, undefined, ip);
    token = res.sessionToken;
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.message };
    }
    console.error("register failed", err);
    return { error: "Something went wrong. Please try again." };
  }

  await setSessionCookie(token);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function loginAction(
  prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const rl = rateLimit("auth:login", ip);
  if (!rl.allowed) {
    return {
      error: `Too many login attempts. Please try again in ${rl.retryAfterSeconds}s.`,
    };
  }

  const input = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  let token: string | undefined;
  try {
    const res = await authenticateUser(input, undefined, ip);
    token = res.sessionToken;
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: err.message };
    }
    console.error("login failed", err);
    return { error: "Something went wrong. Please try again." };
  }

  await setSessionCookie(token);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await logoutUser();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function changePasswordAction(
  prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const user = await getSessionUser();
  if (!user) return { error: "Not authenticated" };

  const ip = await getClientIp();
  const rl = rateLimit("auth:change-password", ip);
  if (!rl.allowed) {
    return {
      error: `Too many attempts. Please try again in ${rl.retryAfterSeconds}s.`,
    };
  }

  const input = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  };

  try {
    await changePassword(user.id, input);
  } catch (err) {
    if (err instanceof AuthError) return { error: err.message };
    console.error("change password failed", err);
    return { error: "Something went wrong. Please try again." };
  }

  await logoutUser();
  revalidatePath("/", "layout");
  redirect("/login?changed=1");
}