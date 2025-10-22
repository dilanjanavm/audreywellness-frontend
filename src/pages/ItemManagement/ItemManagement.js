// src/modules/item/ItemManagement.js
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
import {Table, Tag, Tooltip, Select, Pagination, Upload} from "antd";
import {Plus, Search, Edit, Trash2, Download} from "react-feather";
import {ItemTableColumns} from "../../common/tableColumns";
import * as itemService from "../../service/itemService";
import {useDispatch} from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateItemModal from "../../Components/Common/modal/Items/CreateItemModal";
import UpdateItemModal from "../../Components/Common/modal/Items/UpdateItemModal";
import ItemImportCSV from "../../Components/Common/modal/ImportCsvModal/ItemImportCSV";

const {Option} = Select;

const ItemManagement = () => {
    document.title = "Items | Address Shop";

    const [itemTableList, setItemTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [importModalVisible, setImportModalVisible] = useState(false);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllItems(currentPage, pageSize);
    }, []);

    // Load all items with pagination
    const loadAllItems = (page = 1, limit = 10, searchTerm = '') => {
        setLoading(true);
        popUploader(dispatch, true);
        console.log(searchTerm)
        itemService.getAllItems(page, limit, searchTerm, selectedCategory)
            .then((res) => {
                const itemData = res.data?.data || [];
                const formattedData = formatItemData(itemData);

                setItemTableList(formattedData);
                setCurrentPage(res.data?.page || page);
                setPageSize(res.data?.limit || limit);
                setTotalRecords(res.data?.total || 0);
                setTotalPages(res.data?.totalPages || 0);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
        console.log(value)
        if (!value.trim()) {
            // If search is cleared, load all items
            loadAllItems(1, pageSize, value);

        } else {
            loadAllItems(1, pageSize, value);
        }


    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce((value) => {
            handleSearch(value);
        }, 500),
        [pageSize] // Add dependencies if needed
    );

    // Handle search input change
    const handleSearchChange = (value) => {
        setSearchTerm(value);
        debouncedSearch(value);
    };

    // Format item data with actions
    const formatItemData = (itemData) => {
        return itemData.map((item) => ({
            key: item.id,
            id: item.id,
            type: item.type,
            itemCode: item.itemCode,
            stockId: item.stockId,
            description: item.description,
            category: item.category,
            categoryId: item.categoryId,
            units: item.units,
            dummy: item.dummy,
            mbFlag: item.mbFlag,
            price: item.price,
            altPrice: item.altPrice,
            salesAccount: item.salesAccount,
            inventoryAccount: item.inventoryAccount,
            cogsAccount: item.cogsAccount,
            adjustmentAccount: item.adjustmentAccount,
            wipAccount: item.wipAccount,
            hsCode: item.hsCode,
            longDescription: item.longDescription,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            action: (
                <div className="d-flex gap-2">
                    <Tooltip title="Edit Item">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditItem(item)}
                        >
                            <Edit size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                        <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDeleteItem(item)}
                        >
                            <Trash2 size={14}/>
                        </Button>
                    </Tooltip>
                </div>
            )
        }));
    };

    // Handle create item
    const handleCreateItem = async (values) => {
        try {
            setModalLoading(true);
            await itemService.createItem(values);
            customToastMsg('Item created successfully', 'success');
            setCreateModalVisible(false);
            loadAllItems(currentPage, pageSize);
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle edit item
    const handleEditItem = (item) => {
        setSelectedItem(item);
        setUpdateModalVisible(true);
    };

    // Handle update item
    const handleUpdateItem = async (values) => {
        try {
            setModalLoading(true);
            await itemService.updateItem(selectedItem.itemCode, values);
            customToastMsg('Item updated successfully', 'success');
            setUpdateModalVisible(false);
            loadAllItems(currentPage, pageSize);
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle delete item
    const handleDeleteItem = (item) => {
        customSweetAlert(
            `Do you want to delete item "${item.description}"?`,
            0,
            () => deleteItem(item.itemCode)
        );
    };

    const deleteItem = async (itemCode) => {
        try {
            popUploader(dispatch, true);
            await itemService.deleteItem(itemCode);
            customToastMsg("Item deleted successfully", 1);
            loadAllItems(currentPage, pageSize);
        } catch (error) {
            handleError(error);
        }
    };

    // Handle CSV Export
    const handleExportCSV = () => {
        popUploader(dispatch, true);
        itemService.exportItemsToCSV({
            includeHeaders: true,
            selectedItems: selectedItems.length > 0 ? selectedItems : undefined
        })
            .then((res) => {
                // Create and download CSV file
                const blob = new Blob([res.data], {type: 'text/csv'});
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `items_export_${new Date().toISOString().split('T')[0]}.csv`;
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

    // Handle pagination changes
    const handlePaginationChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
        loadAllItems(page, pageSize);
    };


    const handleImportComplete = (result) => {
        if (result.success) {
            loadAllItems(currentPage, pageSize);
        }
    };


    return (
        <div>
            <CreateItemModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onCreate={handleCreateItem}
                loading={modalLoading}
            />

            <UpdateItemModal
                visible={updateModalVisible}
                item={selectedItem}
                onClose={() => setUpdateModalVisible(false)}
                onUpdate={handleUpdateItem}
                loading={modalLoading}
            />

            <ItemImportCSV
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onImportComplete={handleImportComplete}
            />

            <div className="page-content">
                <Container fluid>
                    <div className="row mt-3">
                        <h4>Item Management</h4>
                    </div>

                    <Card>
                        {/* Search and Action Section */}
                        <Row className="mt-4 mx-2">
                            <Col sm={12} md={6} lg={4}>
                                <FormGroup>
                                    <Label for="search">
                                        <Search size={16} className="me-1"/>
                                        Search Items
                                    </Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by description or item code"
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                    />
                                </FormGroup>
                            </Col>

                            <Col sm={12} md={6} lg={2}>
                                <Label className="opacity-0">
                                    <Search size={16} className="me-1"/>
                                    Action
                                </Label>
                                <Button
                                    color="primary"
                                    className="w-100"
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    <Plus size={16} className="me-1"/>
                                    Add Item
                                </Button>
                            </Col>

                            <Col sm={12} md={6} lg={2}>
                                <Label className="opacity-0">
                                    <Search size={16} className="me-1"/>
                                    Action
                                </Label>
                                <Button
                                    color="success"
                                    outline
                                    className="w-100"
                                    onClick={handleExportCSV}
                                    disabled={itemTableList.length === 0}
                                >
                                    <Download size={16} className="me-1"/>
                                    Export CSV
                                </Button>
                            </Col>

                            <Col sm={12} md={6} lg={2}>
                                <Label className="opacity-0">
                                    Action
                                </Label>
                                <Button
                                    color="success"
                                    outline
                                    className="w-100"
                                    onClick={() => setImportModalVisible(true)}
                                >
                                    <Upload size={16} className="me-1"/>
                                    Import CSV
                                </Button>
                            </Col>

                            <Col sm={12} md={6} lg={2}>
                                <Label className="opacity-0">
                                    Action
                                </Label>
                                <Button
                                    color="info"
                                    outline
                                    className="w-100"
                                    onClick={handleExportCSV}
                                    disabled={itemTableList.length === 0}
                                >
                                    <Download size={16} className="me-1"/>
                                    Export CSV
                                </Button>
                            </Col>
                        </Row>

                        {/* Item Table */}
                        <Row>
                            <Col sm={12}>
                                <Table
                                    className="mx-3 my-4"
                                    pagination={false}
                                    columns={ItemTableColumns}
                                    dataSource={itemTableList}
                                    scroll={{x: "max-content"}}
                                    loading={loading}
                                    locale={{emptyText: "No items found"}}
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
                                        onChange={handlePaginationChange}
                                        onShowSizeChange={handlePaginationChange}
                                        showSizeChanger
                                        showQuickJumper
                                        showTotal={(total, range) =>
                                            `${range[0]}-${range[1]} of ${total} items`
                                        }
                                        pageSizeOptions={['10', '25', '50', '100']}
                                    />
                                </Col>
                            </Row>
                        )}
                    </Card>
                </Container>
            </div>
        </div>
    );
};

export default ItemManagement;