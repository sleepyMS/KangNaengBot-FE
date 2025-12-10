import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChatPage, LoginPage, TermsPage, PrivacyPage } from "@/pages";
import { ToastContainer } from "@/components/common";

function App() {
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
