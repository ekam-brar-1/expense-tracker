// app.config.js
import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    scheme: "myapp",
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      GEMINI_API_KEY : "AIzaSyD9URTuj02n70e99YqcTld4G4xEuINM93E",
    },
  };
};
