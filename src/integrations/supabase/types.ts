export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          applications: Json[] | null
          bathrooms: number | null
          bedrooms: number | null
          contract: string
          created_at: string
          deadline: string
          description: string
          domain: string
          id: string
          image: string | null
          images: string[] | null
          is_housing_offer: boolean | null
          location: string
          positions: number | null
          price: number | null
          publish_date: string | null
          requirements: string | null
          salary: Json
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          applications?: Json[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          contract: string
          created_at?: string
          deadline: string
          description: string
          domain: string
          id?: string
          image?: string | null
          images?: string[] | null
          is_housing_offer?: boolean | null
          location: string
          positions?: number | null
          price?: number | null
          publish_date?: string | null
          requirements?: string | null
          salary?: Json
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          applications?: Json[] | null
          bathrooms?: number | null
          bedrooms?: number | null
          contract?: string
          created_at?: string
          deadline?: string
          description?: string
          domain?: string
          id?: string
          image?: string | null
          images?: string[] | null
          is_housing_offer?: boolean | null
          location?: string
          positions?: number | null
          price?: number | null
          publish_date?: string | null
          requirements?: string | null
          salary?: Json
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          created_at: string
          dates: string | null
          description: string | null
          host: Json
          id: string
          image: string | null
          images: string[] | null
          location: string
          map_location: string | null
          neighborhood: string | null
          price: number
          rating: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dates?: string | null
          description?: string | null
          host?: Json
          id?: string
          image?: string | null
          images?: string[] | null
          location: string
          map_location?: string | null
          neighborhood?: string | null
          price: number
          rating?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dates?: string | null
          description?: string | null
          host?: Json
          id?: string
          image?: string | null
          images?: string[] | null
          location?: string
          map_location?: string | null
          neighborhood?: string | null
          price?: number
          rating?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
