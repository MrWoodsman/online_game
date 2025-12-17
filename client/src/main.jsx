import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// PAGES
import { InRoom } from './pages/InRoom.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { MainPage } from './pages/MainPage.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter basename='/boardv2'>
    <Routes>
      <Route path='/' element={<MainPage />} />
      <Route path='/admin' element={<AdminPage />} />
      <Route path='/room/' element={<InRoom />} />
    </Routes>
  </BrowserRouter>
  // {/* </StrictMode>, */ }
)
