import type { JwtPayload } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export type TableOperation = "select" | "insert" | "update" | "delete";
export type PermissionTable = keyof Database["public"]["Tables"];

export type Permission = `${PermissionTable}.${TableOperation}`;

export interface AppJwtPayload extends JwtPayload {
  role_id?: number;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role_id?: number;
    role?: string;
    permissions?: Permission[];
  };
}
