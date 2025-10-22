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
import {Pagination, Table, Tooltip, Upload, message} from "antd";
import {Plus, Search, Eye, Edit, Trash2, Upload as UploadIcon} from "react-feather";
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
import CreateCustomerModal from "../../Components/Common/modal/CreateCustomerModal";
import ImportCsvModal from "../../Components/Common/modal/ImportCsvModal/ImportCsvModal";

const {Dragger} = Upload;

const CustomerManagement = () => {
    document.title = "Customers | Address Shop";

    const [customerTableList, setCustomerTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedCustomerType, setSelectedCustomerType] = useState("");
    const [selectedSalesType, setSelectedSalesType] = useState("");
    const [statusList, setStatusList] = useState([]);
    const [customerTypeList, setCustomerTypeList] = useState([]);
    const [salesTypeList, setSalesTypeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    // Modal States
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [importModalVisible, setImportModalVisible] = useState(false);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllCustomers(currentPage, pageSize);
        initializeFilterOptions();
    }, []);

    const initializeFilterOptions = () => {
        setStatusList([
            {value: "ACTIVE", label: "Active"},
            {value: "INACTIVE", label: "Inactive"},
        ]);

        setCustomerTypeList([
            {value: "INDIVIDUAL", label: "Individual"},
            {value: "BUSINESS", label: "Business"},
        ]);

        setSalesTypeList([
            {value: "RETAIL", label: "Retail"},
            {value: "WHOLESALE", label: "Wholesale"},
            {value: "CORPORATE", label: "Corporate"},
        ]);
    };

    const handleImportComplete = (result) => {
        // Refresh the customer list after successful import
        if (result.success) {
            loadAllCustomers(currentPage, pageSize);
        }
    };

    // Load all customers with filters
    const loadAllCustomers = (page = 1, limit = 10, search = searchTerm) => {
        setLoading(true);
        popUploader(dispatch, true);
        console.log(search)
        const filters = {
            searchTerm: search,
            status: selectedStatus,
            customerType: selectedCustomerType,
            salesType: selectedSalesType,
        };
        console.log(filters)
        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        customerService.getAllCustomers(page, limit, filters)
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
            sNo: customer.sNo,
            name: customer.name,
            shortName: customer.shortName,
            branchName: customer.branchName,
            cityArea: customer.cityArea,
            email: customer.email,
            smsPhone: customer.smsPhone,
            currency: customer.currency,
            salesType: customer.salesType,
            paymentTerms: customer.paymentTerms,
            status: customer.status,
            salesGroup: customer.salesGroup,
            customerType: customer.customerType,
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

    // Handle create customer
    const handleCreateCustomer = async (values) => {
        try {
            setModalLoading(true);
            await customerService.createCustomer(values);
            customToastMsg('Customer created successfully', 'success');
            setCreateModalVisible(false);
            loadAllCustomers(currentPage, pageSize);
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
            `Do you want to delete customer "${customer.name}"?`,
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

    // Search functionality
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        if (value === '') {
            loadAllCustomers(1, pageSize, '');
        } else {
            debouncedSearch(value);
        }
    };

    const handleSearch = (value) => {
        setLoading(true);
        customerService.searchCustomers(value)
            .then((res) => {
                const customerData = res.data || [];
                const formattedData = formatCustomerData(customerData);
                setCustomerTableList(formattedData);
                setTotalRecords(customerData.length);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                handleError(err);
            });
    };

    const debouncedSearch = useCallback(
        debounce(handleSearch, 500),
        []
    );

    // Handle filter changes
    const handleStatusChange = (statusValue) => {
        setSelectedStatus(statusValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize);
    };

    const handleCustomerTypeChange = (typeValue) => {
        setSelectedCustomerType(typeValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize);
    };

    const handleSalesTypeChange = (salesValue) => {
        setSelectedSalesType(salesValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize);
    };

    // Handle CSV import
    const handleCsvImport = async (file) => {
        try {
            setImportLoading(true);
            const response = await customerService.importCustomersFromCSV(file);

            if (response.data.success) {
                customToastMsg(response.data.message, 'success');
                loadAllCustomers(currentPage, pageSize);

                // Show errors if any
                if (response.data.errors && response.data.errors.length > 0) {
                    message.warning(`Import completed with ${response.data.errors.length} errors`);
                    console.log('Import errors:', response.data.errors);
                }
            } else {
                customToastMsg(response.data.message, 'error');
            }

            setImportLoading(false);
            return false; // Prevent default upload behavior
        } catch (error) {
            setImportLoading(false);
            handleError(error);
            return false;
        }
    };

    // Handle pagination changes
    const handlePaginationChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        loadAllCustomers(page, pageSize);
    };

    const uploadProps = {
        name: 'file',
        multiple: false,
        accept: '.csv',
        beforeUpload: handleCsvImport,
        showUploadList: false,
    };

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Customer Management</h4>
                </div>

                <Card>
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={3}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1"/>
                                    Search Customers
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, email, phone, or S.No"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Status</Label>
                            <Select
                                value={statusList.find(option => option.value === selectedStatus) || null}
                                placeholder="Filter by status"
                                isClearable
                                onChange={(e) => handleStatusChange(e?.value || "")}
                                options={statusList}
                            />
                        </Col>

                        <Col sm={12} md={6} lg={3}>
                            <Label  className='opacity-0'>Customer Type</Label> <br/>
                            <Button
                                color="primary"
                                className="w-50"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                <Plus size={16} className="me-1"/>
                                Add Customer
                            </Button>
                        </Col>

                        <Col sm={12} md={6} lg={3}>
                            <Label className='opacity-0'>Sales Type</Label> <br/>
                            <Button
                                color="success"
                                className="w-50"
                                onClick={() => setImportModalVisible(true)}
                            >
                                <UploadIcon size={16} className="me-1"/>
                                Import CSV
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
                                    onChange={handlePaginationChange}
                                    onShowSizeChange={handlePaginationChange}
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

                <CreateCustomerModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateCustomer}
                    loading={modalLoading}
                />

                <ImportCsvModal
                    visible={importModalVisible}
                    onClose={() => setImportModalVisible(false)}
                    onImportComplete={handleImportComplete}
                />
            </Container>
        </div>
    );
};

export default CustomerManagement;