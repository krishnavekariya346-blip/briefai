import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup.string().required('Password is required'),
});

export type LoginFormValues = yup.InferType<typeof loginSchema>;

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;
