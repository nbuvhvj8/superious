import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './app/layout';
import NewChatPage from './app/new-chat/page';
import SettingsPage from './app/settings/page';

const App = () => {
  return (
    <Router>
      <RootLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/new-chat" replace />} />
          <Route path="/new-chat" element={<NewChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </RootLayout>
    </Router>
  );
};

export default App;
