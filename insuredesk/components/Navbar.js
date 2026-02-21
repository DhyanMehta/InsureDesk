'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Container, Nav, Navbar as BSNavbar, NavDropdown } from 'react-bootstrap'
import { createClient } from '@/utils/supabase/client'

export default function Navbar({ user }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (path) => pathname === path

  return (
    <BSNavbar 
      bg="white" 
      expand="lg" 
      className="shadow-soft sticky-top border-0" 
      style={{ 
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Container>
        <Link href="/home" className="navbar-brand d-flex align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center" 
               style={{
                 width: '40px',
                 height: '40px',
                 borderRadius: '12px',
                 background: 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
                 boxShadow: '0 4px 12px rgba(91, 108, 255, 0.3)'
               }}>
            <svg className="text-white" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            InsureDesk
          </span>
        </Link>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto gap-1 align-items-lg-center">
            <Link 
              href="/home" 
              className={`nav-link px-3 py-2 rounded-pill d-flex align-items-center gap-2 ${
                isActive('/home') ? 'fw-semibold' : ''
              }`}
              style={isActive('/home') ? {
                background: 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
                color: 'white !important',
                boxShadow: '0 4px 12px rgba(91, 108, 255, 0.3)'
              } : {}}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span>Dashboard</span>
            </Link>
            
            <Link 
              href="/customers" 
              className={`nav-link px-3 py-2 rounded-pill d-flex align-items-center gap-2 ${
                isActive('/customers') ? 'fw-semibold' : ''
              }`}
              style={isActive('/customers') ? {
                background: 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
                color: 'white !important',
                boxShadow: '0 4px 12px rgba(91, 108, 255, 0.3)'
              } : {}}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
              <span>Customers</span>
            </Link>
            
            <Link 
              href="/customers/add" 
              className={`nav-link px-3 py-2 rounded-pill d-flex align-items-center gap-2 ${
                isActive('/customers/add') ? 'fw-semibold' : ''
              }`}
              style={isActive('/customers/add') ? {
                background: 'linear-gradient(135deg, #5B6CFF 0%, #7F8CFF 100%)',
                color: 'white !important',
                boxShadow: '0 4px 12px rgba(91, 108, 255, 0.3)'
              } : {}}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Add Customer</span>
            </Link>
            
            <NavDropdown
              title={
                <span className="d-flex align-items-center gap-2">
                  <div 
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #A78BFA 0%, #C4B5FD 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="d-none d-lg-inline">Account</span>
                </span>
              }
              id="basic-nav-dropdown"
              className="ms-2"
              align="end"
            >
              <Link href="/profile" className="dropdown-item d-flex align-items-center gap-2 py-2">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Profile
              </Link>
              <NavDropdown.Divider />
              <button 
                onClick={handleLogout} 
                className="dropdown-item text-danger d-flex align-items-center gap-2 py-2"
                style={{ cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Logout
              </button>
            </NavDropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}
