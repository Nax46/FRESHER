import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://chaudharynax27_db_user:Nax-2903@cluster0.8f3mgjg.mongodb.net/fresher_event_db?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'fresher_super_secret_jwt_key_2026',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'fresher2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
