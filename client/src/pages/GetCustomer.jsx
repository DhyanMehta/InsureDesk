// GetDataPage.jsx
import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Table,
    Spinner,
    Alert,
} from "react-bootstrap";
import API from "../utils/api";
import * as XLSX from "sheetjs-style";

const GetDataPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await API.get("/customers");
            setCustomers(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("❌ Error fetching customers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = search.trim().toLowerCase();
        if (!query) return setFiltered(customers);

        const results = customers.filter((cust) =>
            Object.values(cust).some(
                (val) => val && val.toString().toLowerCase().includes(query)
            )
        );
        setFiltered(results);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filtered.map(cust => ({
            "Customer": cust.CUSTOMER_NAME || "-",
            "Company": cust.INSURANCE_COMPANY || "-",
            "Category": cust.SUB_CATEGORY || "-",
            "Reg No": cust.REGISTRATION_NO || "-",
            "Vehicle": cust.VEHICLE_NAME || "-",
            "Policy #": cust.POLICY_NUMBER || "-",
            "Start Date": cust.START_DATE || "-",
            "End Date": cust.END_DATE || "-",
            "Premium": cust.PREMIUM != null ? parseFloat(cust.PREMIUM).toFixed(2) : "-",
            "Agency": cust.AGENCY || "-",
            "Mobile": cust.MOBILE_NO || "-",
            "Email": cust.MAIL_ID || "-",
            "Ref By": cust.REF_BY || "-",
        })));

        // Add yellow header styling
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[cell_address]) continue;
            worksheet[cell_address].s = {
                fill: {
                    fgColor: { rgb: "FFFF00" },
                },
                font: { bold: true },
            };
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
        XLSX.writeFile(workbook, "CustomerData.xlsx");
    };

    return (
        <Container className="mt-5">
            <h3 className="mb-4 text-primary">Export Customer Data</h3>
            <Form onSubmit={handleSearch} className="mb-3">
                <Row>
                    <Col md={8}>
                        <Form.Control
                            size="sm"
                            type="text"
                            placeholder="Search by any field..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                if (!e.target.value.trim()) setFiltered(customers);
                            }}
                        />
                    </Col>
                    <Col md={4} className="text-end">
                        <Button type="submit" variant="secondary" className="me-2">
                            Search
                        </Button>
                        <Button onClick={exportToExcel} variant="success">
                            Export Excel
                        </Button>
                    </Col>
                </Row>
            </Form>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="info" />
                </div>
            ) : filtered.length === 0 ? (
                <Alert variant="warning">No customer data to export.</Alert>
            ) : (
                <Table bordered hover size="sm">
                    <thead className="bg-light">
                        <tr>
                            <th>Customer</th>
                            <th>Company</th>
                            <th>Category</th>
                            <th>Reg No</th>
                            <th>Vehicle</th>
                            <th>Policy #</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Premium</th>
                            <th>Agency</th>
                            <th>Mobile</th>
                            <th>Email</th>
                            <th>Ref By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((cust, idx) => (
                            <tr key={idx}>
                                <td>{cust.CUSTOMER_NAME || "-"}</td>
                                <td>{cust.INSURANCE_COMPANY || "-"}</td>
                                <td>{cust.SUB_CATEGORY || "-"}</td>
                                <td>{cust.REGISTRATION_NO || "-"}</td>
                                <td>{cust.VEHICLE_NAME || "-"}</td>
                                <td>{cust.POLICY_NUMBER || "-"}</td>
                                <td>{cust.START_DATE || "-"}</td>
                                <td>{cust.END_DATE || "-"}</td>
                                <td>{cust.PREMIUM != null ? parseFloat(cust.PREMIUM).toFixed(2) : "-"}</td>
                                <td>{cust.AGENCY || "-"}</td>
                                <td>{cust.MOBILE_NO || "-"}</td>
                                <td>{cust.MAIL_ID || "-"}</td>
                                <td>{cust.REF_BY || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default GetDataPage;
