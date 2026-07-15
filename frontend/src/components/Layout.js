// src/components/Layout.jsx
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Header from './Header'; // 👈 Import du Header

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header /> {/* ✅ Ajout du Header */}
      <div style={{ display: 'flex', flex: 1 }}>
        {isMobile && (
          <button
            onClick={toggleSidebar}
            style={{
              position: 'fixed',
              top: '60px', // ajusté pour être sous le header
              left: '10px',
              zIndex: 1001,
              backgroundColor: '#8b0000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            ☰
          </button>
        )}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
        <div style={{
          flex: 1,
          marginLeft: (!isMobile || sidebarOpen) ? '150px' : '0',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          transition: 'margin-left 0.3s ease'
        }}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;