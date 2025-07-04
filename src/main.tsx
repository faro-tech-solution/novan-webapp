import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Import debug utilities in development
import "./utils/achievementDebug";

// Render the app with AuthProvider and LanguageProvider
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </AuthProvider>
);
