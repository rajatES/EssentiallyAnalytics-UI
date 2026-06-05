"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/api";

export type UserRole = "admin" | "management" | "user";

interface RoleContextValue {
  role: UserRole;
  loading: boolean;
  canAccess: (minRole: UserRole) => boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  management: 2,
  user: 1,
};

const RoleContext = createContext<RoleContextValue>({
  role: "user",
  loading: true,
  canAccess: () => false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read role from cookie first for instant hydration
    const cookieRole = document.cookie
      .split("; ")
      .find((c) => c.startsWith("user_role="))
      ?.split("=")[1] as UserRole | undefined;

    if (cookieRole && ROLE_HIERARCHY[cookieRole]) {
      setRole(cookieRole);
      setLoading(false);
    }

    apiClient
      .get("/api/auth/me")
      .then((res) => {
        const serverRole = res.data.role as UserRole;
        if (ROLE_HIERARCHY[serverRole]) {
          setRole(serverRole);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const canAccess = (minRole: UserRole) =>
    ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];

  return (
    <RoleContext.Provider value={{ role, loading, canAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
