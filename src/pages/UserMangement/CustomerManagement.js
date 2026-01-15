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
import {Pagination, Table, Tooltip, Upload, message, Dropdown, Button as AntButton} from "antd";
import {Plus, Search, Eye, Edit, Trash2, Upload as UploadIcon, Download, ChevronDown} from "react-feather";
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
    const [selectedCityArea, setSelectedCityArea] = useState("");
    const [statusList, setStatusList] = useState([]);
    const [customerTypeList, setCustomerTypeList] = useState([]);
    const [salesTypeList, setSalesTypeList] = useState([]);
    const [exportLoading, setExportLoading] = useState(false);
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
        initializeFilterOptions();
        loadAllCustomers(1, pageSize, '');
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

    // Load all customers with filters - matches backend endpoint structure
    // GET /customers?page=1&limit=10&search=john&status=ACTIVE&salesType=RETAIL
    const loadAllCustomers = (page = 1, limit = 10, search = searchTerm) => {
        setLoading(true);
        popUploader(dispatch, true);
        
        // Build filters object matching backend API structure
        const filters = {};
        
        // Add search parameter (backend uses 'search')
        if (search && search.trim()) {
            filters.search = search.trim();
        }
        
        // Add filter parameters (only non-empty values)
        if (selectedStatus) {
            filters.status = selectedStatus;
        }
        if (selectedCustomerType) {
            filters.customerType = selectedCustomerType;
        }
        if (selectedSalesType) {
            filters.salesType = selectedSalesType;
        }
        if (selectedCityArea) {
            filters.cityArea = selectedCityArea;
        }

        customerService.getAllCustomers(page, limit, filters)
            .then((res) => {
                // Handle backend response structure:
                // {
                //   "statusCode": 200,
                //   "data": [...],
                //   "total": 127,
                //   "page": 1,
                //   "limit": 10,
                //   "totalPages": 13,
                //   "pageCount": 13,
                //   "perPageRows": 10,
                //   "hasNextPage": true,
                //   "hasPrevPage": false
                // }
                let customerData = [];
                let totalRecords = 0;
                let currentPageNum = page;
                let pageSizeNum = limit;

                if (res?.statusCode === 200 || res?.success !== false) {
                    // Backend response structure: data array and pagination info at root level
                    if (Array.isArray(res.data)) {
                        customerData = res.data;
                        totalRecords = res.total || res.data.length;
                        currentPageNum = res.page || page;
                        pageSizeNum = res.limit || res.perPageRows || limit;
                    } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
                        // Alternative: nested data structure
                        customerData = res.data.data;
                        totalRecords = res.data.total || res.total || customerData.length;
                        currentPageNum = res.data.page || res.page || page;
                        pageSizeNum = res.data.limit || res.limit || limit;
                    } else if (res.data && res.data.records && Array.isArray(res.data.records)) {
                        // Alternative: records array
                        customerData = res.data.records;
                        totalRecords = res.data.total || res.total || customerData.length;
                        currentPageNum = res.data.page || res.page || page;
                        pageSizeNum = res.data.limit || res.limit || limit;
                    } else if (res.data && Array.isArray(res.data.customers)) {
                        // Alternative: customers array
                        customerData = res.data.customers;
                        totalRecords = res.data.total || res.total || customerData.length;
                        currentPageNum = res.data.page || res.page || page;
                        pageSizeNum = res.data.limit || res.limit || limit;
                    } else {
                        customerData = [];
                    }
                }

                const formattedData = formatCustomerData(customerData);

                setCurrentPage(currentPageNum);
                setPageSize(pageSizeNum);
                setTotalRecords(totalRecords);
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

    // Search functionality - use getAllCustomers with searchTerm filter for pagination support
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        // Use loadAllCustomers with search filter instead of separate search function
        debouncedLoadCustomers(value);
    };

    const debouncedLoadCustomers = useCallback(
        debounce((searchValue) => {
            loadAllCustomers(1, pageSize, searchValue);
        }, 500),
        [pageSize, selectedStatus, selectedCustomerType, selectedSalesType, selectedCityArea]
    );

    // Handle filter changes
    const handleStatusChange = (statusValue) => {
        setSelectedStatus(statusValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize, searchTerm);
    };

    const handleCustomerTypeChange = (typeValue) => {
        setSelectedCustomerType(typeValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize, searchTerm);
    };

    const handleSalesTypeChange = (salesValue) => {
        setSelectedSalesType(salesValue);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize, searchTerm);
    };

    const handleCityAreaChange = (e) => {
        const value = e.target.value;
        setSelectedCityArea(value);
        setCurrentPage(1);
        loadAllCustomers(1, pageSize, searchTerm);
    };

    // Handle CSV Export - with filters
    const handleExportCSVWithFilters = () => {
        setExportLoading(true);
        popUploader(dispatch, true);
        
        // Build filters object from current state
        const filters = {};
        if (selectedCityArea && selectedCityArea.trim()) {
            filters.cityArea = selectedCityArea.trim();
        }
        if (selectedStatus) {
            filters.status = selectedStatus;
        }
        if (selectedCustomerType) {
            filters.customerType = selectedCustomerType;
        }
        if (selectedSalesType) {
            filters.salesType = selectedSalesType;
        }
        if (searchTerm && searchTerm.trim()) {
            filters.search = searchTerm.trim();
        }
        
        customerService.exportCustomersCSV(filters)
            .then((res) => {
                // Create and download CSV file
                const blob = new Blob([res.data], {type: 'text/csv;charset=utf-8;'});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const dateStr = new Date().toISOString().split('T')[0];
                const filterStr = Object.keys(filters).length > 0 ? '_filtered' : '';
                link.download = `customers_export${filterStr}_${dateStr}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                popUploader(dispatch, false);
                setExportLoading(false);
                customToastMsg('CSV exported successfully with current filters', 'success');
            })
            .catch((err) => {
                popUploader(dispatch, false);
                setExportLoading(false);
                handleError(err);
            });
    };

    // Handle CSV Export - without filters (all customers)
    const handleExportCSVAll = () => {
        setExportLoading(true);
        popUploader(dispatch, true);
        
        customerService.exportCustomersCSV({})
            .then((res) => {
                // Create and download CSV file
                const blob = new Blob([res.data], {type: 'text/csv;charset=utf-8;'});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const dateStr = new Date().toISOString().split('T')[0];
                link.download = `customers_export_all_${dateStr}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                popUploader(dispatch, false);
                setExportLoading(false);
                customToastMsg('All customers exported successfully', 'success');
            })
            .catch((err) => {
                popUploader(dispatch, false);
                setExportLoading(false);
                handleError(err);
            });
    };

    // Export menu items
    const exportMenuItems = [
        {
            key: 'export-all',
            label: (
                <span>
                    <Download size={14} className="me-2" />
                    Export All Customers
                </span>
            ),
            onClick: handleExportCSVAll,
        },
        {
            key: 'export-filtered',
            label: (
                <span>
                    <Download size={14} className="me-2" />
                    Export with Current Filters
                </span>
            ),
            onClick: handleExportCSVWithFilters,
        },
    ];

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
    const handlePaginationChange = (page, newPageSize) => {
        setCurrentPage(page);
        setPageSize(newPageSize);
        loadAllCustomers(page, newPageSize, searchTerm);
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
                    {/* Filters Row */}
                    <Row className="mt-4 mx-2 mb-3">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup className="mb-0">
                                <Label for="search" className="mb-2 d-block">
                                    <Search size={16} className="me-1"/>
                                    Search Customers
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, email, phone, or S.No"
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    style={{ height: '38px' }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <FormGroup className="mb-0">
                                <Label className="mb-2 d-block">Status</Label>
                                <Select
                                    value={statusList.find(option => option.value === selectedStatus) || null}
                                    placeholder="Filter by status"
                                    isClearable
                                    onChange={(e) => handleStatusChange(e?.value || "")}
                                    options={statusList}
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            minHeight: '38px',
                                            height: '38px',
                                        }),
                                        valueContainer: (base) => ({
                                            ...base,
                                            height: '38px',
                                            padding: '0 8px',
                                        }),
                                        input: (base) => ({
                                            ...base,
                                            margin: '0px',
                                        }),
                                        indicatorsContainer: (base) => ({
                                            ...base,
                                            height: '38px',
                                        }),
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <FormGroup className="mb-0">
                                <Label for="cityArea" className="mb-2 d-block">City/Area</Label>
                                <Input
                                    id="cityArea"
                                    placeholder="e.g., Kandy, Colombo"
                                    value={selectedCityArea}
                                    onChange={handleCityAreaChange}
                                    style={{ height: '38px' }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={4} className="d-flex align-items-end gap-2">
                        <FormGroup className="mb-0">
                                <Label for="search" className="text-white mb-2 d-block">
                                     Search Customers
                                </Label>
                                   <Button
                                color="primary"
                                onClick={() => setCreateModalVisible(true)}
                                className="flex-shrink-0"
                                style={{ height: '38px' }}
                            >
                                <Plus size={16} className="me-1"/>
                                Add Customer
                            </Button>
                            </FormGroup>

                            <FormGroup className="mb-0">
                                <Label for="search" className="text-white mb-2 d-block">
                                     Search Customers
                                </Label>    
                            <Button
                                color="success"
                                onClick={() => setImportModalVisible(true)}
                                className="flex-shrink-0"
                                style={{ height: '38px' }}
                            >
                                <UploadIcon size={16} className="me-1"/>
                                Import CSV
                            </Button>
                            </FormGroup>
                            <FormGroup className="mb-0">
                                <Label for="search" className="text-white mb-2 d-block">
                              
                                    Search Customers
                                </Label>
                            <Dropdown
                                menu={{ items: exportMenuItems }}
                                trigger={['click']}
                                disabled={exportLoading}
                            >
                                <AntButton
                                    type="default"
                                    loading={exportLoading}
                                    className="d-flex align-items-center flex-shrink-0"
                                    style={{ height: '38px' }}
                                >
                                    <Download size={16} className="me-1" />
                                    Export CSV <ChevronDown size={14} className="ms-1" />
                                </AntButton>
                            </Dropdown>
                            </FormGroup>
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
                                    total > 0 
                                        ? `${range[0]}-${range[1]} of ${total} customers`
                                        : 'No customers'
                                }
                                pageSizeOptions={['10', '25', '50', '100']}
                                disabled={loading}
                            />
                        </Col>
                    </Row>
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