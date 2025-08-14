export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          preferences: UserPreferences;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface UserPreferences {
  shared_access?: SharedAccess[];
  shared_access_to?: string; // User ID that this user has access to see data for
  [key: string]: any;
}

export interface SharedAccess {
  user_id: string;
  email: string;
  granted_at: string;
  permissions?: string[];
}