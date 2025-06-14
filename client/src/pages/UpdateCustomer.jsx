import React, { useEffect, useState } from "react";
import {
    Container,
    Card,
    Form,
    Button,
    Row,
    Col,
    Alert,
    Spinner,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";

const UpdateCustomer = () => {
    const { policyNumber } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const requiredFields = [
        "CUSTOMER_NAME",
        "INSURANCE_COMPANY",
        "SUB_CATEGORY",
        "POLICY_NUMBER",
        "START_DATE",
        "END_DATE",
        "AGENCY",
    ];

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await API.get(`/customers/${policyNumber}`);
                const data = res.data;

                // Format date fields to YYYY-MM-DD
                if (data.START_DATE) {
                    data.START_DATE = data.START_DATE.split("T")[0];
                }
                if (data.END_DATE) {
                    data.END_DATE = data.END_DATE.split("T")[0];
                }

                setFormData(data);
            } catch (err) {
                setError("Failed to fetch customer data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [policyNumber]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const cleanedData = Object.fromEntries(
                Object.entries(formData).map(([key, val]) => {
                    if (val === "") return [key, null];
                    if (key === "PREMIUM") return [key, parseFloat(val) || null];
                    return [key, val];
                })
            );

            await API.put(`/customers/${policyNumber}`, cleanedData);
            setSuccess("Customer updated successfully!");
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            console.error("❌ Error updating customer:", err);
            setError("Failed to update customer. Please try again.");
        }
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!formData) {
        return (
            <Container className="text-center mt-5">
                <Alert variant="danger">Customer not found.</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card className="p-4 shadow-sm" style={{ maxWidth: "700px", width: "100%" }}>
                <h3 className="mb-4" style={{ color: "#0c5460" }}>Update Customer</h3>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-3">
                        {Object.keys(formData)
                            .filter((key) => key !== "CREATED_AT") // ✅ remove CREATED_AT
                            .map((key, index) => (
                                <Col md={6} key={index}>
                                    <Form.Group>
                                        <Form.Label>
                                            {key.replace(/_/g, " ")}{" "}
                                            {requiredFields.includes(key) && (
                                                <span className="text-danger">*</span>
                                            )}
                                        </Form.Label>
                                        <Form.Control
                                            type={["START_DATE", "END_DATE"].includes(key) ? "date" : "text"}
                                            name={key}
                                            value={formData[key] ?? ""}
                                            onChange={handleChange}
                                            required={requiredFields.includes(key)}
                                            disabled={key === "POLICY_NUMBER"}
                                        />
                                    </Form.Group>
                                </Col>
                            ))}
                    </Row>

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="secondary"
                            className="me-2"
                            onClick={() => navigate("/home")}
                        >
                            Cancel
                        </Button>
                        <Button variant="info" type="submit">
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default UpdateCustomer;
