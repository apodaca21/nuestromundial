export interface UserProfile {
  id: string
  display_name: string
  created_at: string
  updated_at: string
}

export interface SignUpInput {
  email: string
  password: string
  displayName: string
}

export interface SignInInput {
  email: string
  password: string
}
