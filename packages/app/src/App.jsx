import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './styles/globalStyles.css';
import './styles/auth.css';
import './styles/chat.css';
import './styles/styles.css';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp/>} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}