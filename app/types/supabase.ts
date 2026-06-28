export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      Changelog: {
        Row: {
          changes: Json
          created_at: string
          createdby_id: string | null
          id: number
          operation: string
          schema_name: string
          table_name: string
          vehicle_id: number | null
        }
        Insert: {
          changes: Json
          created_at?: string
          createdby_id?: string | null
          id?: number
          operation: string
          schema_name: string
          table_name: string
          vehicle_id?: number | null
        }
        Update: {
          changes?: Json
          created_at?: string
          createdby_id?: string | null
          id?: number
          operation?: string
          schema_name?: string
          table_name?: string
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Changelog_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      Profiles: {
        Row: {
          created_at: string
          id: number
          name: string | null
          profile_image_url: string | null
          role_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          profile_image_url?: string | null
          role_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          profile_image_url?: string | null
          role_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
        ]
      }
      Roles: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      RolesPermissions: {
        Row: {
          created_at: string
          createdby_id: string | null
          delete: boolean | null
          id: number
          insert: boolean | null
          role_id: number
          table_name: string
          update: boolean | null
        }
        Insert: {
          created_at?: string
          createdby_id?: string | null
          delete?: boolean | null
          id?: number
          insert?: boolean | null
          role_id: number
          table_name: string
          update?: boolean | null
        }
        Update: {
          created_at?: string
          createdby_id?: string | null
          delete?: boolean | null
          id?: number
          insert?: boolean | null
          role_id?: number
          table_name?: string
          update?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "RolesPermissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "Roles"
            referencedColumns: ["id"]
          },
        ]
      }
      VehicleDocuments: {
        Row: {
          created_at: string
          file_path: string
          file_size: number | null
          id: number
          name: string | null
          service_log_id: number | null
          type: string | null
          vehicle_id: number
        }
        Insert: {
          created_at?: string
          file_path: string
          file_size?: number | null
          id?: number
          name?: string | null
          service_log_id?: number | null
          type?: string | null
          vehicle_id: number
        }
        Update: {
          created_at?: string
          file_path?: string
          file_size?: number | null
          id?: number
          name?: string | null
          service_log_id?: number | null
          type?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "VehicleDocuments_service_log_id_fkey"
            columns: ["service_log_id"]
            isOneToOne: false
            referencedRelation: "VehicleServiceLogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "VehicleDocuments_service_log_id_fkey"
            columns: ["service_log_id"]
            isOneToOne: false
            referencedRelation: "vehicleservicelogs_with_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "VehicleDocuments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      VehicleExpenses: {
        Row: {
          amount: number | null
          cost: number | null
          created_at: string
          createdby_id: string | null
          currency: string | null
          date: string
          id: number
          mileage: number | null
          notes: string | null
          price_per_unit: number | null
          type: string | null
          unit: string | null
          vehicle_id: number
        }
        Insert: {
          amount?: number | null
          cost?: number | null
          created_at?: string
          createdby_id?: string | null
          currency?: string | null
          date?: string
          id?: number
          mileage?: number | null
          notes?: string | null
          price_per_unit?: number | null
          type?: string | null
          unit?: string | null
          vehicle_id: number
        }
        Update: {
          amount?: number | null
          cost?: number | null
          created_at?: string
          createdby_id?: string | null
          currency?: string | null
          date?: string
          id?: number
          mileage?: number | null
          notes?: string | null
          price_per_unit?: number | null
          type?: string | null
          unit?: string | null
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "VehicleExpenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      VehicleManufacturers: {
        Row: {
          codes: string[] | null
          created_at: string
          id: number
          name: string
          sort_order: number | null
        }
        Insert: {
          codes?: string[] | null
          created_at?: string
          id?: number
          name: string
          sort_order?: number | null
        }
        Update: {
          codes?: string[] | null
          created_at?: string
          id?: number
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      Vehicles: {
        Row: {
          body_type: string | null
          color: string | null
          created_at: string
          createdby_id: string | null
          drivetrain: string | null
          engine_cylinders: number | null
          engine_displacement: number | null
          engine_displacement_unit: string | null
          fuel_capacity: number | null
          fuel_capacity_unit: string | null
          fuel_type: string | null
          id: number
          licenseplate_number: string | null
          make: string | null
          mileage_unit: string | null
          model: string | null
          model_year: number | null
          owner_user_id: string | null
          search_column: unknown
          thumbnail: string | null
          transmission_gears: number | null
          transmission_type: string | null
          type: string | null
          vehicle_identification_number: string | null
          weight: number | null
        }
        Insert: {
          body_type?: string | null
          color?: string | null
          created_at?: string
          createdby_id?: string | null
          drivetrain?: string | null
          engine_cylinders?: number | null
          engine_displacement?: number | null
          engine_displacement_unit?: string | null
          fuel_capacity?: number | null
          fuel_capacity_unit?: string | null
          fuel_type?: string | null
          id?: number
          licenseplate_number?: string | null
          make?: string | null
          mileage_unit?: string | null
          model?: string | null
          model_year?: number | null
          owner_user_id?: string | null
          search_column?: unknown
          thumbnail?: string | null
          transmission_gears?: number | null
          transmission_type?: string | null
          type?: string | null
          vehicle_identification_number?: string | null
          weight?: number | null
        }
        Update: {
          body_type?: string | null
          color?: string | null
          created_at?: string
          createdby_id?: string | null
          drivetrain?: string | null
          engine_cylinders?: number | null
          engine_displacement?: number | null
          engine_displacement_unit?: string | null
          fuel_capacity?: number | null
          fuel_capacity_unit?: string | null
          fuel_type?: string | null
          id?: number
          licenseplate_number?: string | null
          make?: string | null
          mileage_unit?: string | null
          model?: string | null
          model_year?: number | null
          owner_user_id?: string | null
          search_column?: unknown
          thumbnail?: string | null
          transmission_gears?: number | null
          transmission_type?: string | null
          type?: string | null
          vehicle_identification_number?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Vehicles_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      VehicleServiceLogs: {
        Row: {
          cost: number | null
          created_at: string
          createdby_id: string | null
          currency: string | null
          date: string
          id: number
          mileage: number | null
          notes: string | null
          provider: string | null
          type: string
          vehicle_id: number
        }
        Insert: {
          cost?: number | null
          created_at?: string
          createdby_id?: string | null
          currency?: string | null
          date?: string
          id?: number
          mileage?: number | null
          notes?: string | null
          provider?: string | null
          type: string
          vehicle_id: number
        }
        Update: {
          cost?: number | null
          created_at?: string
          createdby_id?: string | null
          currency?: string | null
          date?: string
          id?: number
          mileage?: number | null
          notes?: string | null
          provider?: string | null
          type?: string
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "VehicleServiceLogs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      VehicleServiceLogsItems: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          id: number
          quantity: number | null
          service_log_id: number
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: number
          quantity?: number | null
          service_log_id: number
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: number
          quantity?: number | null
          service_log_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "VehicleServiceLogsItems_service_log_id_fkey"
            columns: ["service_log_id"]
            isOneToOne: false
            referencedRelation: "VehicleServiceLogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "VehicleServiceLogsItems_service_log_id_fkey"
            columns: ["service_log_id"]
            isOneToOne: false
            referencedRelation: "vehicleservicelogs_with_items"
            referencedColumns: ["id"]
          },
        ]
      }
      VehicleShares: {
        Row: {
          created_at: string
          createdby_id: string | null
          id: number
          readonly: boolean
          updated_at: string | null
          user_id: string
          vehicle_id: number
        }
        Insert: {
          created_at?: string
          createdby_id?: string | null
          id?: number
          readonly?: boolean
          updated_at?: string | null
          user_id: string
          vehicle_id: number
        }
        Update: {
          created_at?: string
          createdby_id?: string | null
          id?: number
          readonly?: boolean
          updated_at?: string | null
          user_id?: string
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "VehiclesShared_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "VehiclesShared_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      changelog_with_profile: {
        Row: {
          changes: Json | null
          created_at: string | null
          createdby_id: string | null
          createdby_name: string | null
          createdby_profile_image_url: string | null
          id: number | null
          operation: string | null
          schema_name: string | null
          table_name: string | null
          vehicle_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Changelog_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicleservicelogs_with_items: {
        Row: {
          created_at: string | null
          createdby_id: string | null
          createdby_name: string | null
          currency: string | null
          date: string | null
          id: number | null
          mileage: number | null
          notes: string | null
          provider: string | null
          total_cost: number | null
          type: string | null
          vehicle_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "VehicleServiceLogs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "Vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_permission: {
        Args: { operation: string; tablename: string }
        Returns: boolean
      }
      get_last_mileage: {
        Args: { type?: string; vehicle_id: number }
        Returns: {
          mileage: number
          unit: string
        }[]
      }
      get_service_insights: {
        Args: { service_log_id: number; vehicle_id: number }
        Returns: {
          avg_interval: number
          previous_date: string
          previous_mileage: number
          type: string
        }[]
      }
      has_vehicle_access: { Args: { p_vehicle_id: number }; Returns: boolean }
      jwt_custom_claims: { Args: { event: Json }; Returns: Json }
      terminate_user: { Args: { profile_user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
