import { Container, Row, Col } from 'react-bootstrap'

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Contact Section */}
      <div className="bg-primary text-white py-3">
        <Container>
          <Row className="text-center text-md-start">
            <Col md={4} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <i className="bi bi-telephone-fill me-2" style={{ fontSize: '22px' }}></i>
                <div>
                  <h6 className="mb-0" style={{ fontSize: '1.1rem' }}>Call Us</h6>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>+91 7622014528</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <i className="bi bi-envelope-fill me-2" style={{ fontSize: '22px' }}></i>
                <div>
                  <h6 className="mb-0" style={{ fontSize: '1.1rem' }}>Email</h6>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>dhyanm2701@gmail.com</p>
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <i className="bi bi-instagram me-2" style={{ fontSize: '22px' }}></i>
                <div>
                  <h6 className="mb-0" style={{ fontSize: '1.1rem' }}>Instagram</h6>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>@insurDesk</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Copyright Section */}
      <div className="bg-dark text-white py-3">
        <Container>
          <div className="text-center">
            <p className="mb-0">
              © 2026 InsureDesk. All rights reserved.
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}
