import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgresql://postgres.hrymkisunxfdybhdbyim:TubWOBkWYqNDIVAI@aws-0-ca-central-1.pooler.supabase.com:6543/postgres",
  },
});
