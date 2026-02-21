'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Container, Button, Row, Col, Spinner } from 'react-bootstrap'
import { createClient } from '@/utils/supabase/client'

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [supabase])

  return (
    <div className="min-vh-100 d-flex flex-column">
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <Container>
          <Link href="/" className="navbar-brand">
            <i className="bi bi-shield-check me-2"></i>
            InsureDesk
          </Link>
          <div className="d-flex gap-2">
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : user ? (
              <Link href="/home">
                <Button variant="primary">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline-primary">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </Container>
      </nav>

      <main className="flex-grow-1">
        <Container className="py-5">
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">
                Welcome to <span className="text-primary">InsureDesk</span>
              </h1>
              <p className="lead mb-4">
                Your comprehensive insurance management solution. Track policies, 
                manage customers, and streamline your insurance business operations.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                {loading ? (
                  <Spinner animation="border" />
                ) : user ? (
                  <Link href="/home">
                    <Button variant="primary" size="lg">
                      <i className="bi bi-speedometer2 me-2"></i>
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button variant="primary" size="lg">
                        Get Started
                        <i className="bi bi-arrow-right ms-2"></i>
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline-primary" size="lg">
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <i className="bi bi-clipboard-data text-primary" style={{ fontSize: '10rem', opacity: 0.8 }}></i>
              </div>
            </Col>
          </Row>

          <Row className="mt-5 g-4">
            <Col md={4}>
              <div className="feature-card text-center">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h4 className="mt-3 fw-bold">Customer Management</h4>
                <p className="text-muted">
                  Easily manage customer information and policy details with our intuitive interface
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card text-center">
                <i className="bi bi-file-earmark-text-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h4 className="mt-3 fw-bold">Policy Tracking</h4>
                <p className="text-muted">
                  Track all insurance policies in one centralized location with real-time updates
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card text-center">
                <i className="bi bi-graph-up-arrow text-primary" style={{ fontSize: '2.5rem' }}></i>
                <h4 className="mt-3 fw-bold">Reports & Analytics</h4>
                <p className="text-muted">
                  Generate detailed reports and export data to Excel for comprehensive analysis
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="footer mt-auto">
        <Container>
          <div className="text-center text-muted">
            <p className="mb-0">
              © 2026 InsureDesk. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}
