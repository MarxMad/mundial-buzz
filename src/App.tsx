import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Web3Provider } from './components/Web3Provider'
import Navbar from './components/Navbar'
import MobileNavigation from './components/MobileNavigation'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Partidos from './pages/Partidos'
import Mercados from './pages/Mercados'
import Perfil from './pages/Perfil'
import Comunidad from './pages/Comunidad'

const AppContent = () => {
  const location = useLocation()
  const showMobileNav = ['/', '/partidos', '/comunidad', '/mercados', '/perfil'].includes(location.pathname)

  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/mercados" element={<Mercados />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/comunidad" element={<Comunidad />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showMobileNav && <MobileNavigation />}
    </div>
  )
}

const App = () => {
  return (
    <Web3Provider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
          <Navbar />
          <AppContent />
        </div>
      </BrowserRouter>
    </Web3Provider>
  )
}

export default App
