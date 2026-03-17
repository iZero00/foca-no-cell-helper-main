export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; role: string; created_at: string };
        Insert: { user_id: string; role?: string; created_at?: string };
        Update: { user_id?: string; role?: string; created_at?: string };
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          price_cents: number;
          currency: string;
          category: string;
          is_active: boolean;
          stock: number;
          variations: Json;
          images: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          title: string;
          slug: string;
          price_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          price_cents: number;
          currency: string;
          category: string;
          sort_order: number;
          is_active: boolean;
          images: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]> & { title: string };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };
    };
  };
};

