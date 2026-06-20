import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required.")
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(80, "Name must be less than 80 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long.")
      .regex(/[A-Z]/, "Use at least one uppercase letter.")
      .regex(/[a-z]/, "Use at least one lowercase letter.")
      .regex(/[0-9]/, "Use at least one number."),

    confirmPassword: z
      .string()
      .min(1, "Confirm your password.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match."
  });

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type RegisterSchemaInput = z.infer<typeof registerSchema>;