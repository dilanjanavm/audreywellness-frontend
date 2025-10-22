// src/modules/supplier/SupplierManagement.js
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
import {Table, Tag, Tooltip, Select, Switch, Statistic, Upload, message} from "antd";
import {Plus, Search, Edit, Trash2, Download, Upload as UploadIcon, Eye, Users} from "react-feather";
import {SupplierTableColumns} from "../../common/tableColumns";
import * as supplierService from "../../service/supplierService";
import {useDispatch} from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateSupplierModal from "../../Components/Common/modal/Supplier/CreateSupplierModal";
import UpdateSupplierModal from "../../Components/Common/modal/Supplier/UpdateSupplierModal";
import './style.scss'

const {Option} = Select;

const SupplierManagement = () => {
    document.title = "Suppliers | Address Shop";

    const [supplierTableList, setSupplierTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState(true);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadSuppliers();
        loadStats();
    }, [currentPage, pageSize, activeFilter]);

    // Load suppliers with pagination
    const loadSuppliers = () => {
        setLoading(true);
        popUploader(dispatch, true);

        supplierService.getAllSuppliers(currentPage, pageSize, searchTerm, activeFilter, true)
            .then((res) => {
                const supplierData = res.data?.data || [];
                const formattedData = formatSupplierData(supplierData);

                setSupplierTableList(formattedData);
                setTotalRecords(res.data?.total || 0);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Load statistics
    const loadStats = () => {
        supplierService.getSupplierStats()
            .then((res) => {
                setStats(res.data);
            })
            .catch((err) => {
                console.error('Error loading stats:', err);
            });
    };

    // Format supplier data with actions
    const formatSupplierData = (supplierData) => {
        return supplierData.map((supplier) => ({
            key: supplier.id,
            id: supplier.id,
            supplierCode: supplier.supplierCode,
            name: supplier.name,
            reference: supplier.reference,
            address: supplier.address,
            contactPerson: supplier.contactPerson,
            email: supplier.email,
            phone: supplier.phone,
            phone2: supplier.phone2,
            fax: supplier.fax,
            ntnNumber: supplier.ntnNumber,
            gstNumber: supplier.gstNumber,
            paymentTerms: supplier.paymentTerms,
            taxGroup: supplier.taxGroup,
            currency: supplier.currency,
            isActive: supplier.isActive,
            items: supplier.items || [],
            itemCount: supplier.items ? supplier.items.length : 0,
            createdAt: supplier.createdAt,
            updatedAt: supplier.updatedAt,
            action: (
                <div className="d-flex gap-2">
                    {/*<Tooltip title="View Details">*/}
                    {/*    <Button*/}
                    {/*        size="sm"*/}
                    {/*        color="info"*/}
                    {/*        outline*/}
                    {/*        onClick={() => handleViewSupplier(supplier.id)}*/}
                    {/*    >*/}
                    {/*        <Eye size={14}/>*/}
                    {/*    </Button>*/}
                    {/*</Tooltip>*/}
                    <Tooltip title="Edit Supplier">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditSupplier(supplier)}
                        >
                            <Edit size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Supplier">
                        <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDeleteSupplier(supplier)}
                        >
                            <Trash2 size={14}/>
                        </Button>
                    </Tooltip>
                </div>
            )
        }));
    };

    // Handle create supplier
    const handleCreateSupplier = async (values) => {
        try {
            setModalLoading(true);
            await supplierService.createSupplier(values);
            customToastMsg('Supplier created successfully', 'success');
            setCreateModalVisible(false);
            loadSuppliers();
            loadStats();
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle view supplier
    const handleViewSupplier = async (supplierId) => {
        try {
            popUploader(dispatch, true);
            const response = await supplierService.getSupplierById(supplierId, true);
            setSelectedSupplier(response.data);
            // You can open a view modal here or navigate to details page
            customToastMsg('Supplier details loaded', 'info');
            popUploader(dispatch, false);
        } catch (error) {
            popUploader(dispatch, false);
            handleError(error);
        }
    };

    // Handle edit supplier
    const handleEditSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setUpdateModalVisible(true);
    };

    // Handle update supplier
    const handleUpdateSupplier = async (values) => {
        try {
            setModalLoading(true);
            await supplierService.updateSupplier(selectedSupplier.id, values);
            customToastMsg('Supplier updated successfully', 'success');
            setUpdateModalVisible(false);
            loadSuppliers();
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle delete supplier
    const handleDeleteSupplier = (supplier) => {
        customSweetAlert(
            `Do you want to delete supplier "${supplier.name}"?`,
            0,
            () => deleteSupplier(supplier.id)
        );
    };

    const deleteSupplier = async (supplierId) => {
        try {
            popUploader(dispatch, true);
            await supplierService.deleteSupplier(supplierId);
            customToastMsg("Supplier deleted successfully", 1);
            loadSuppliers();
            loadStats();
        } catch (error) {
            handleError(error);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);

        if (!value.trim()) {
            loadSuppliers();
            return;
        }

        debouncedSearch(value);
    };

    const debouncedSearch = useCallback(
        debounce((value) => {
            setLoading(true);
            supplierService.getAllSuppliers(1, pageSize, value, activeFilter, true)
                .then((res) => {
                    const supplierData = res.data?.data || [];
                    const formattedData = formatSupplierData(supplierData);
                    setSupplierTableList(formattedData);
                    setTotalRecords(res.data?.total || 0);
                    setLoading(false);
                })
                .catch((err) => {
                    setLoading(false);
                    handleError(err);
                });
        }, 500),
        [pageSize, activeFilter]
    );

    // Handle CSV Export
    const handleExportCSV = () => {
        popUploader(dispatch, true);
        supplierService.exportSuppliersCSV()
            .then((res) => {
                // Create and download CSV file
                const blob = new Blob([res.data], {type: 'text/csv'});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `suppliers_export_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
                popUploader(dispatch, false);
                customToastMsg('CSV exported successfully', 'success');
            })
            .catch((err) => {
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Handle CSV Import
    const handleImportCSV = (file) => {
        const formData = new FormData();
        formData.append('file', file);

        popUploader(dispatch, true);
        supplierService.importSuppliersCSV(formData)
            .then((res) => {
                popUploader(dispatch, false);
                const result = res.data;
                customToastMsg(
                    `Import completed: ${result.successful} successful, ${result.failed} failed`,
                    result.failed === 0 ? 'success' : 'warning'
                );
                loadSuppliers();
                loadStats();
            })
            .catch((err) => {
                popUploader(dispatch, false);
                handleError(err);
            });

        return false; // Prevent default upload
    };

    // Upload props
    const uploadProps = {
        beforeUpload: handleImportCSV,
        accept: '.csv',
        showUploadList: false,
    };

    // Handle pagination changes
    const handlePaginationChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Supplier Management</h4>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <Row gutter={16} className="mb-4 mt-2">
                        <Col span={6}>
                            <Card className='px-4 py-2'>
                                <Statistic
                                    title="Total Suppliers"
                                    value={stats.totalSuppliers}
                                    prefix={<Users size={20}/>}
                                    valueStyle={{color: '#3f8600'}}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card className='px-4 py-2'>
                                <Statistic
                                    title="Active Suppliers"
                                    value={stats.activeSuppliers}
                                    prefix={<Users size={20}/>}
                                    valueStyle={{color: '#1890ff'}}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card className='px-4 py-2'>
                                <Statistic
                                    title="Recently Added"
                                    value={stats.recentlyAdded}
                                    prefix={<Users size={20}/>}
                                    valueStyle={{color: '#722ed1'}}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card className='px-4 py-2'>
                                    <Statistic
                                    title="Inactive Suppliers"
                                    value={stats.totalSuppliers - stats.activeSuppliers}
                                    prefix={<Users size={20}/>}
                                    valueStyle={{color: '#cf1322'}}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                <Card>
                    {/* Search and Action Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1"/>
                                    Search Suppliers
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, reference, or phone"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={2}>
                            <Label>Status Filter</Label>
                            <div className="d-flex align-items-center">
                                <Switch
                                    checked={activeFilter}
                                    onChange={setActiveFilter}
                                    checkedChildren="Active"
                                    unCheckedChildren="All"
                                />
                            </div>
                        </Col>

                        <Col sm={12} md={6} lg={3} className="">
                            <Label className='opacity-0'>Status Filter</Label>
                            <Button
                                color="primary"
                                className="w-100"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                <Plus size={16} className="me-1"/>
                                Add Supplier
                            </Button>
                        </Col>

                        {/*<Col sm={12} md={6} lg={2} >*/}
                        {/*    <Upload {...uploadProps}>*/}
                        {/*        <Label className='opacity-0'>Status Filter</Label>*/}

                        {/*        <Button*/}
                        {/*            color="success"*/}
                        {/*            outline*/}
                        {/*            className="w-100"*/}
                        {/*        >*/}
                        {/*            <UploadIcon size={16} className="me-1"/>*/}
                        {/*            Import CSV*/}
                        {/*        </Button>*/}
                        {/*    </Upload>*/}
                        {/*</Col>*/}

                        <Col sm={12} md={6} lg={3}  >
                            <Label className='opacity-0'>Status Filter</Label>
                            <Button
                                color="info"
                                outline
                                className="w-100"
                                onClick={handleExportCSV}
                                disabled={supplierTableList.length === 0}
                            >
                                <Download size={16} className="me-1"/>
                                Export CSV
                            </Button>
                        </Col>
                    </Row>

                    {/* Supplier Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalRecords,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) =>
                                        `${range[0]}-${range[1]} of ${total} suppliers`,
                                    pageSizeOptions: ['10', '25', '50', '100'],
                                    onChange: handlePaginationChange,
                                    onShowSizeChange: handlePaginationChange,
                                }}
                                columns={SupplierTableColumns}
                                dataSource={supplierTableList}
                                scroll={{x: "max-content"}}
                                loading={loading}
                                locale={{emptyText: "No suppliers found"}}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreateSupplierModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateSupplier}
                    loading={modalLoading}
                />

                <UpdateSupplierModal
                    visible={updateModalVisible}
                    supplier={selectedSupplier}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdateSupplier}
                    loading={modalLoading}
                />
            </Container>
        </div>
    );
};

export default SupplierManagement;