import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Table,
    Badge,
    Spinner,
    Alert,
    Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const HomePage = () => {
    const [customers, setCustomers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (searchValue = "") => {
        setLoading(true);
        try {
            const [customerRes, userRes] = await Promise.all([
                searchValue
                    ? API.get(`/customers/search?q=${encodeURIComponent(searchValue)}`)
                    : API.get("/customers"),
                API.get("/auth/profile"),
            ]);
            setCustomers(customerRes.data);
            setUser(userRes.data);
        } catch (err) {
            console.error("❌ Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData(search.trim());
    };

    const confirmDelete = (customer) => {
        setCustomerToDelete(customer);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!customerToDelete) return;

        try {
            await API.delete(`/customers/${customerToDelete.POLICY_NUMBER}`);
            setSuccessMsg(`${customerToDelete.CUSTOMER_NAME} deleted successfully`);
            setShowModal(false);
            fetchData();
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err) {
            console.error("❌ Error deleting customer:", err);
            setSuccessMsg("Failed to delete customer. Please try again.");
            setShowModal(false);
            setTimeout(() => setSuccessMsg(""), 4000);
        }
    };

    const displayValue = (val) => {
        return val === null || val === undefined || val === "" ? "-" : val;
    };

    const totalCols = 15;
    const narrowWidth = "40px";
    const wideColumnWidth = `calc((100% - ${narrowWidth}) / ${totalCols - 1})`;

    const headers = [
        "#",
        "Customer",
        "Company",
        "Category",
        "Reg No",
        "Vehicle",
        "Policy #",
        "Start",
        "End",
        "Premium",
        "Agency",
        "Mobile",
        "Email",
        "Ref By",
        "Actions",
    ];

    return (
        <Container fluid className="mt-5 px-4">
            <h2 className="text-center mb-4">
                Welcome to <span className="text-info">Insuredesk</span>,{" "}
                <span className="text-primary">{user ? user.name : "Agent"}</span> 👋
            </h2>

            <Form onSubmit={handleSearch}>
                <Row className="mb-4 align-items-center">
                    <Col md={8}>
                        <div className="d-flex gap-2">
                            <Form.Control
                                size="sm"
                                style={{ maxWidth: "250px" }}
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSearch(val);
                                    if (val.trim() === "") {
                                        fetchData();
                                    }
                                }}
                            />
                            <Button variant="secondary" size="sm" type="submit">
                                Search
                            </Button>
                        </div>
                    </Col>
                    <Col md={4} className="text-end d-flex justify-content-end gap-2">
                        <Button variant="outline-primary" onClick={() => navigate("/get-customer")}>
                            Get Excel
                        </Button>
                        <Button variant="success" onClick={() => navigate("/add-customer")}>
                            Add Customer
                        </Button>
                    </Col>

                </Row>
            </Form>

            {successMsg && (
                <Alert variant="success" className="py-2 px-3">
                    {successMsg}
                </Alert>
            )}

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="info" />
                </div>
            ) : (
                <div className="overflow-auto">
                    <Table
                        bordered
                        hover
                        size="sm"
                        className="bg-white shadow-sm text-wrap text-break"
                        style={{ tableLayout: "fixed", width: "100%" }}
                    >
                        <thead style={{ backgroundColor: "#f5f5f5" }} className="fw-semibold text-dark">
                            <tr>
                                {headers.map((col, idx) => (
                                    <th
                                        key={idx}
                                        style={{
                                            width: idx === 0 ? narrowWidth : wideColumnWidth,
                                        }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={totalCols} className="text-center text-muted">
                                        No customers found.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((cust, index) => (
                                    <tr key={cust.POLICY_NUMBER}>
                                        <td>{index + 1}</td>
                                        <td>{displayValue(cust.CUSTOMER_NAME)}</td>
                                        <td>{displayValue(cust.INSURANCE_COMPANY)}</td>
                                        <td>{displayValue(cust.SUB_CATEGORY)}</td>
                                        <td>{displayValue(cust.REGISTRATION_NO)}</td>
                                        <td>{displayValue(cust.VEHICLE_NAME)}</td>
                                        <td>
                                            <Badge bg="secondary">
                                                {displayValue(cust.POLICY_NUMBER)}
                                            </Badge>
                                        </td>
                                        <td>{displayValue(cust.START_DATE)}</td>
                                        <td>{displayValue(cust.END_DATE)}</td>
                                        <td>
                                            {cust.PREMIUM != null
                                                ? parseFloat(cust.PREMIUM).toFixed(2)
                                                : "-"}
                                        </td>
                                        <td>{displayValue(cust.AGENCY)}</td>
                                        <td>{displayValue(cust.MOBILE_NO)}</td>
                                        <td>{displayValue(cust.MAIL_ID)}</td>
                                        <td>{displayValue(cust.REF_BY)}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="me-2"
                                                style={{ width: "90px" }}
                                                onClick={() =>
                                                    navigate(`/update-customer/${cust.POLICY_NUMBER}`)
                                                }
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                style={{ width: "90px" }}
                                                onClick={() => confirmDelete(cust)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete{" "}
                    <strong>{customerToDelete?.CUSTOMER_NAME}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default HomePage;
