import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatPage, LoginPage, TermsPage, PrivacyPage } from "@/pages";
import { ToastContainer } from "@/components/common";
import { useSettingsStore } from "@/store";

function App() {
  const { initializeTheme } = useSettingsStore();

  // 앱 전체에서 테마 초기화 (모든 라우트에 적용)
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
