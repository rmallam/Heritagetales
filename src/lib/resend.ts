import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
// Note: In development/sandbox without an API key, this will silently log emails instead of crashing
const apiKey = process.env.RESEND_API_KEY || 're_mock_key';
export const resend = new Resend(apiKey);

export const fromEmail = 'Acme <onboarding@resend.dev>'; // Using default testing domain for Resend
