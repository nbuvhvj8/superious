import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RouterProvider } from './lib/compat/next';
import RootLayout from './app/layout';
import NewChatPage from './app/new-chat/page';
import SettingsPage from './app/settings/page';

const App = () => {
  return (
    <Router>
      <RouterProvider>
        <RootLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/new-chat" replace />} />
            <Route path="/new-chat" element={<NewChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </RootLayout>
      </RouterProvider>
    </Router>
  );
};

export default App;
