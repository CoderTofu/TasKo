export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface User {
  id: string
  email: string
  name?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  createdAt: string
  updatedAt?: string
}