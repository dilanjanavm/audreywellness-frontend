import React, {useEffect, useState, useCallback} from "react";
import {
    Container,
    Card,
    Row,
    Col,
    Label,
    Input,
    FormGroup,
    Button,
} from "reactstrap";
import {Pagination, Table, Tooltip} from "antd";
import {Plus, Search, Eye, Edit, Trash2} from "react-feather";
import {CustomerTableColumns} from "../../common/tableColumns";
import * as customerService from "../../service/customerService";
import {useDispatch} from "react-redux";
import Select from "react-select";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import UpdateCustomerModal from "../../Components/Common/modal/UpdateCustomerModal";
import CustomerDetailsModal from "../../Components/Common/modal/CustomerDetailsModal";

// Import Modal Components


const CustomerManagement = () => {
    document.title = "Customers | Address Shop";

    const [customerTableList, setCustomerTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [statusList, setStatusList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal States
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllCustomers(currentPage, pageSize);
        setStatusList([
            {value: 1, label: "Active"},
            {value: 2, label: "Inactive"},
        ]);
    }, []);

    // Load all customers
    const loadAllCustomers = (page = 1, limit = 10) => {
        setLoading(true);
        customerService.getAllCustomers(page, limit)
            .then((res) => {
                const customerData = res.data?.data || [];
                const formattedData = formatCustomerData(customerData);

                setCurrentPage(res.data?.page || page);
                setPageSize(res.data?.limit || limit);
                setTotalRecords(res.data?.total || 0);
                setCustomerTableList(formattedData);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Format customer data with actions
    const formatCustomerData = (customerData) => {
        return customerData.map((customer) => ({
            key: customer.id,
            id: customer.id,
            customerCode: customer.customerCode,
            fullName: customer.fullName,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            city: customer.city,
            country: customer.country,
            status: customer.status || 1,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            action: (
                <div className="d-flex gap-2">
                    <Tooltip title="View Details">
                        <Button
                            size="sm"
                            color="primary"
                            outline
                            onClick={() => handleViewCustomer(customer.id)}
                        >
                            <Eye size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Edit Customer">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditCustomer(customer.id)}
                        >
                            <Edit size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Customer">
                        <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDeleteCustomer(customer)}
                        >
                            <Trash2 size={14}/>
                        </Button>
                    </Tooltip>
                </div>
            )
        }));
    };

    // Handle view customer
    const handleViewCustomer = async (customerId) => {
        try {
            setModalLoading(true);
            const response = await customerService.getCustomerById(customerId);
            setSelectedCustomer(response.data);
            setViewModalVisible(true);
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle edit customer
    const handleEditCustomer = async (customerId) => {
        try {
            setModalLoading(true);
            const response = await customerService.getCustomerById(customerId);
            setSelectedCustomer(response.data);
            setUpdateModalVisible(true);
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle update customer
    const handleUpdateCustomer = async (values) => {
        try {
            setModalLoading(true);
            await customerService.updateCustomer(selectedCustomer.id, values);
            customToastMsg('Customer updated successfully', 'success');
            setUpdateModalVisible(false);
            loadAllCustomers(currentPage, pageSize);
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle delete customer
    const handleDeleteCustomer = (customer) => {
        customSweetAlert(
            `Do you want to delete customer "${customer.fullName}"?`,
            0,
            () => deleteCustomer(customer.id)
        );
    };

    const deleteCustomer = async (customerId) => {
        try {
            popUploader(dispatch, true);
            await customerService.deleteCustomer(customerId);
            customToastMsg("Customer deleted successfully", 1);
            loadAllCustomers(currentPage, pageSize);
        } catch (error) {
            handleError(error);
        }
    };

    // Search and other functions remain the same...
    const searchCustomers = useCallback((searchTerm, status, page = 1, limit = 10) => {
        setLoading(true);
        const searchData = {searchTerm, status, page, limit};

        customerService.searchCustomers(searchData)
            .then((res) => {
                const customerData = res.data?.data || [];
                const formattedData = formatCustomerData(customerData);

                setCurrentPage(res.data?.page || page);
                setPageSize(res.data?.limit || limit);
                setTotalRecords(res.data?.total || 0);
                setCustomerTableList(formattedData);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                handleError(err);
            });
    }, []);

    const debouncedSearch = useCallback(
        debounce(searchCustomers, 500),
        [searchCustomers]
    );

    // ... (rest of the search and pagination functions)

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Customer Management</h4>
                </div>

                <Card>
                    {/* Search and Filter Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1"/>
                                    Search Customers
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, email, or phone"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={3}>
                            <Label>Status</Label>
                            <Select
                                value={statusList.find(option => option.value === selectedStatus) || null}
                                placeholder="Filter by status"
                                isClearable
                                onChange={(e) => handleStatusChange(e?.value || "")}
                                options={statusList}
                            />
                        </Col>

                        <Col sm={12} md={6} lg={3} className="d-flex align-items-end">
                            <Button color="primary" className="w-100">
                                <Plus size={16} className="me-1"/>
                                Add Customer
                            </Button>
                        </Col>
                    </Row>

                    {/* Customer Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={false}
                                columns={CustomerTableColumns}
                                dataSource={customerTableList}
                                scroll={{x: "max-content"}}
                                loading={loading}
                                locale={{emptyText: "No customers found"}}
                            />
                        </Col>
                    </Row>

                    {/* Pagination */}
                    {totalRecords > 0 && (
                        <Row>
                            <Col className="d-flex justify-content-end" sm={12}>
                                <Pagination
                                    className="m-3"
                                    current={currentPage}
                                    pageSize={pageSize}
                                    total={totalRecords}
                                    showSizeChanger
                                    showQuickJumper
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} of ${total} customers`
                                    }
                                    pageSizeOptions={['10', '25', '50', '100']}
                                />
                            </Col>
                        </Row>
                    )}
                </Card>

                {/* Modal Components */}
                <CustomerDetailsModal
                    visible={viewModalVisible}
                    customer={selectedCustomer}
                    onClose={() => setViewModalVisible(false)}
                />

                <UpdateCustomerModal
                    visible={updateModalVisible}
                    customer={selectedCustomer}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdateCustomer}
                    loading={modalLoading}
                />
            </Container>
        </div>
    );
};

export default CustomerManagement;