'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Row, Col, Button, Form, Table, Spinner, Alert, Card } from 'react-bootstrap'
import * as XLSX from 'sheetjs-style'

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      setCustomers(data)
      setFiltered(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const query = search.trim().toLowerCase()
    if (!query) {
      setFiltered(customers)
      return
    }

    const results = customers.filter((cust) =>
      Object.values(cust).some(
        (val) => val && val.toString().toLowerCase().includes(query)
      )
    )
    setFiltered(results)
  }

  const handleDelete = async (policyNumber) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${policyNumber}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer')
      }

      // Refresh the list
      fetchCustomers()
    } catch (err) {
      alert(err.message)
    }
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((cust) => ({
        Customer: cust.CUSTOMER_NAME || '-',
        Company: cust.INSURANCE_COMPANY || '-',
        Category: cust.SUB_CATEGORY || '-',
        'Reg No': cust.REGISTRATION_NO || '-',
        Vehicle: cust.VEHICLE_NAME || '-',
        'Policy #': cust.POLICY_NUMBER || '-',
        'Start Date': cust.START_DATE || '-',
        'End Date': cust.END_DATE || '-',
        Premium: cust.PREMIUM != null ? parseFloat(cust.PREMIUM).toFixed(2) : '-',
        Agency: cust.AGENCY || '-',
        Mobile: cust.MOBILE_NO || '-',
        Email: cust.MAIL_ID || '-',
        'Ref By': cust.REF_BY || '-',
      }))
    )

    // Add yellow header styling
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSX.utils.encode_cell({ r: 0, c: C })
      if (!worksheet[cell_address]) continue
      worksheet[cell_address].s = {
        fill: {
          fgColor: { rgb: 'FFFF00' },
        },
        font: { bold: true },
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers')
    XLSX.writeFile(workbook, `InsureDesk_Customers_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading customers...</p>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 mb-3">
            <i className="bi bi-people me-2"></i>
            Customers
          </h1>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <Form onSubmit={handleSearch}>
                <Form.Group>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search customers..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <i className="bi bi-search me-2"></i>
                      Search
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSearch('')
                        setFiltered(customers)
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="success"
                onClick={exportToExcel}
                disabled={filtered.length === 0}
                className="me-2"
              >
                <i className="bi bi-file-earmark-excel me-2"></i>
                Export to Excel
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/customers/add')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add New
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filtered.length === 0 ? (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3 text-muted">No customers found</h5>
            <p className="text-muted">
              {customers.length === 0
                ? 'Start by adding your first customer'
                : 'Try adjusting your search criteria'}
            </p>
            {customers.length === 0 && (
              <Button variant="primary" onClick={() => router.push('/customers/add')}>
                <i className="bi bi-plus-circle me-2"></i>
                Add Customer
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Policy #</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Premium</th>
                    <th>Mobile</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.CUSTOMER_NAME || '-'}</td>
                      <td>{customer.INSURANCE_COMPANY || '-'}</td>
                      <td>{customer.SUB_CATEGORY || '-'}</td>
                      <td>{customer.POLICY_NUMBER}</td>
                      <td>{customer.START_DATE || '-'}</td>
                      <td>{customer.END_DATE || '-'}</td>
                      <td>
                        {customer.PREMIUM != null
                          ? `₹${parseFloat(customer.PREMIUM).toFixed(2)}`
                          : '-'}
                      </td>
                      <td>{customer.MOBILE_NO || '-'}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            router.push(`/customers/edit/${customer.POLICY_NUMBER}`)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(customer.POLICY_NUMBER)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
          <Card.Footer className="text-muted">
            Showing {filtered.length} of {customers.length} customers
          </Card.Footer>
        </Card>
      )}
    </Container>
  )
}
