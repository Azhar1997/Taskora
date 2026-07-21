"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { signupSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function signupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return { error: "An account with that email already exists." };
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  const workspaceSlug = `${slugify(parsed.data.name)}-workspace`;
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: {
        create: {
          hash,
        },
      },
    },
  });

  await prisma.workspace.create({
    data: {
      name: `${parsed.data.name.split(" ")[0]}'s Workspace`,
      slug: `${workspaceSlug}-${Math.random().toString(36).slice(2, 6)}`,
      description: "Your default workspace for planning projects, tracking tasks, and collaborating with a team.",
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/dashboard",
  });

  return { success: `Welcome aboard, ${user.name}.` };
}

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    redirect("/dashboard");
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Invalid email or password.",
      };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}
