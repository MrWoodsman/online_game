import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InRoom } from './pages/InRoom.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/admin' element={<AdminPage />} />
      <Route path='/room/:id' element={<InRoom />} />
    </Routes>
  </BrowserRouter>
  // {/* </StrictMode>, */ }
)
