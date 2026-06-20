import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
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
      .min(2, "Name must contain at least 2 characters.")
      .max(80, "Name cannot contain more than 80 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email address is required.")
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password cannot exceed 128 characters."),

    confirmPassword: z
      .string()
      .min(1, "Confirm your password.")
  })
  .refine(
    (values) =>
      values.password === values.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "The passwords do not match."
    }
  );

export const registerApiSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),

  image_url: z.string().url().nullable().optional(),
  image_public_id: z.string().nullable().optional()
});

export type LoginFormValues = z.infer<
  typeof loginSchema
>;

export type RegisterFormValues = z.infer<
  typeof registerSchema
>;