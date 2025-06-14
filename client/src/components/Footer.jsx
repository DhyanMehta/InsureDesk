import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPhoneAlt, FaEnvelope, FaInstagram } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <>
      {/* Contact / Call to Action Section */}
      <section id="contact" className="text-white py-3" style={{ backgroundColor: '#0d6efd' }}>
        <Container>
          <h2 className="text-center mb-3" style={{ fontSize: '1.75rem' }}>Get in Touch</h2>
          <Row className="justify-content-center text-center">
            <Col md={4} className="mb-2">
              <FaPhoneAlt size={22} className="mb-1" />
              <h5 style={{ fontSize: '1.1rem' }}>Mobile</h5>
              <p style={{ fontSize: '0.9rem' }}>+91 7622014528</p>
            </Col>
            <Col md={4} className="mb-2">
              <FaEnvelope size={22} className="mb-1" />
              <h5 style={{ fontSize: '1.1rem' }}>Email</h5>
              <p style={{ fontSize: '0.9rem' }}>
                <Link to="mailto:dhyanm2701@gmail.com" className="text-white text-decoration-underline">
                  dhyanm2701@gmail.com
                </Link>
              </p>
            </Col>
            <Col md={4} className="mb-2">
              <FaInstagram size={22} className="mb-1" />
              <h5 style={{ fontSize: '1.1rem' }}>Instagram</h5>
              <p style={{ fontSize: '0.9rem' }}>
                <Link to="https://instagram.com/insurDesk" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-underline">
                  @insurDesk
                </Link>
              </p>
            </Col>
          </Row>
        </Container>
      </section>


      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} InsurDesk. All rights reserved.</p>
        </Container>
      </footer>
    </>
  );
}

export default Footer;
