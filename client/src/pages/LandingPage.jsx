import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';


function LandingPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="text-center py-5" style={{ background: '#f8f9fa' }}>
                <Container>
                    <h1 className="display-4 fw-bold">Secure Customer Data Management for Companies</h1>
                    <p className="lead text-muted">InsureDesk helps you manage and protect your customer data with ease and compliance.</p>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5" style={{ backgroundColor: '#ffffff' }}>
                <Container>
                    <h2 className="text-center mb-5 text-primary">Key Features</h2>
                    <Row className="justify-content-center">
                        <Col md={6} lg={4}>
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body>
                                    <Card.Title className="text-success">CRUD Operations</Card.Title>
                                    <Card.Text>
                                        Seamlessly create, read, update, and delete customer data with a secure and user-friendly interface.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={4}>
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body>
                                    <Card.Title className="text-success">Excel Export</Card.Title>
                                    <Card.Text>
                                        Export your data to Excel for offline backups, reports, or compliance documentation in a single click.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={4}>
                            <Card className="mb-4 shadow-sm border-0">
                                <Card.Body>
                                    <Card.Title className="text-success">More Features</Card.Title>
                                    <Card.Text>
                                        Role-based access, real-time backups, advanced filters, and seamless cloud storage integration.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* About Section */}
            <section id="about" className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <h2 className="text-primary">About InsurDesk</h2>
                            <p className="text-muted">
                                We are a technology-first company delivering secure, modern solutions to insurance providers. With deep knowledge of privacy laws and industry workflows, we help organizations stay compliant and efficient.
                            </p>
                        </Col>
                        <Col md={6}>
                            <img src="https://m.foolcdn.com/media/dubs/images/Getty_-_insurance_life_car_home_family_protect.width-880.jpg" className="img-fluid rounded shadow-sm" alt="About InsuraSafe" />
                        </Col>
                    </Row>
                </Container>
            </section>



        </>
    );
}

export default LandingPage;
