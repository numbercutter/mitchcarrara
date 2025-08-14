// Simple list of approved emails that can access the dashboard
export const APPROVED_EMAILS = [
    'numbercutter@protonmail.com', // Main owner
    'jamlets@protonmail.com',      // Assistant
    // Add more emails here as needed
];

export function isEmailApproved(email: string): boolean {
    return APPROVED_EMAILS.includes(email.toLowerCase());
}