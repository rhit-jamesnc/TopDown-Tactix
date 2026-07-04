const OWNER_PASS = process.env.REACT_APP_OWNER_PASSWORD;
const ADMIN_PASS = process.env.REACT_APP_ADMIN_PASSWORD;

if (!OWNER_PASS || !ADMIN_PASS) {
  throw new Error("Missing required environment variables for Admin configuration!");
}

export const ADMIN_CONFIG = {
  PASSWORDS: {
    OWNER: OWNER_PASS,
    ADMIN: ADMIN_PASS,
  },
  TYPES: {
    OWNER: 'owner',
    ADMIN: 'admin',
  }
};