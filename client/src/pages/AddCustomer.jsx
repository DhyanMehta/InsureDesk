import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    CUSTOMER_NAME: "",
    INSURANCE_COMPANY: "",
    SUB_CATEGORY: "",
    REGISTRATION_NO: "",
    VEHICLE_NAME: "",
    POLICY_NUMBER: "",
    START_DATE: "",
    END_DATE: "",
    PREMIUM: "",
    AGENCY: "",
    MOBILE_NO: "",
    MAIL_ID: "",
    REF_BY: "",
  });

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

      await API.post("/customers", cleanedData);
      setSuccess("Customer added successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("❌ Error saving customer:", err);
      setError("Failed to save customer. Please check the data and try again.");
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="p-4 shadow-sm" style={{ maxWidth: "700px", width: "100%" }}>
        <h3 className="mb-4 text-primary">Add New Customer</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {Object.keys(formData).map((key, index) => (
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
                    value={formData[key] || ""}
                    onChange={handleChange}
                    required={requiredFields.includes(key)}
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={() => navigate("/home")}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Customer
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default AddCustomer;
