'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { createClient } from '@/utils/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Check for URL parameters (e.g., confirmation success/error)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const successParam = searchParams.get('success')

    if (errorParam === 'confirmation_failed') {
      setError('Email confirmation failed. Please try signing up again.')
    } else if (successParam === 'confirmed') {
      setSuccess('Email confirmed successfully! You can now login.')
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Standard Supabase email/password login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        } else if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before logging in. Check your inbox for the confirmation link.')
        }
        throw signInError
      }

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Please confirm your email before logging in. Check your inbox for the confirmation link.')
      }

      router.push('/home')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Link href="/" className="back-link">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Home
            </Link>
            <Card className="shadow-lg auth-card">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-shield-check text-primary" style={{ fontSize: '2.5rem' }}></i>
                  <h2 className="mt-3 mb-1">Welcome Back!</h2>
                  <p className="text-muted">Login to InsureDesk</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <Link href="/signup" className="text-primary">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

// Loading fallback for Suspense
function LoginLoading() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Spinner animation="border" variant="primary" />
    </div>
  )
}

// Export with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}
