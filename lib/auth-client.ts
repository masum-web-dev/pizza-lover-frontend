// import { createAuthClient } from "better-auth/react"
// export const authClient = createAuthClient({
//     /** The base URL of the server (optional if you're using the same domain) */
//     baseURL: process.env.BETTER_AUTH_URL
// })

// export const { signIn, signUp, useSession, signOut } = createAuthClient()

import { createAuthClient } from "better-auth/react";

const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  ...(baseURL ? { baseURL } : {}),
});

export const { signIn, signUp, useSession, signOut } = authClient;