'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    )
  }

  // User data from Supabase Auth
  const name = user?.user_metadata?.name || 'User'
  const email = user?.email || ''
  const created_at = user?.created_at || new Date().toISOString()

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Profile Information
              </h4>
            </Card.Header>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i>
              </div>

              <div className="mb-4">
                <label className="text-muted small">Full Name</label>
                <h5>{name}</h5>
              </div>

              <div className="mb-4">
                <label className="text-muted small">Email Address</label>
                <h5>{email}</h5>
              </div>

              <div className="mb-0">
                <label className="text-muted small">Member Since</label>
                <h5>{new Date(created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</h5>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
