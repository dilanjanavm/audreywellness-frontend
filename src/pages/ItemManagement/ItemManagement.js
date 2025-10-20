// src/modules/item/ItemManagement.js
import React, { useEffect, useState, useCallback } from "react";
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
import { Table, Tag, Tooltip, Select, Checkbox } from "antd";
import { Plus, Search, Edit, Trash2, Download, Upload } from "react-feather";
import { ItemTableColumns } from "../../common/tableColumns";
import * as itemService from "../../service/itemService";
import { useDispatch } from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateItemModal from "../../Components/Common/modal/Items/CreateItemModal";
import UpdateItemModal from "../../Components/Common/modal/Items/UpdateItemModal";



const { Option } = Select;

const ItemManagement = () => {
    document.title = "Items | Address Shop";

    const [itemTableList, setItemTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllItems();
    }, []);

    // Load all items
    const loadAllItems = () => {
        setLoading(true);
        popUploader(dispatch, true);

        itemService.getAllItems()
            .then((res) => {
                const itemData = res.data || [];
                const formattedData = formatItemData(itemData);

                setItemTableList(formattedData);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Format item data with actions
    const formatItemData = (itemData) => {
        return itemData.map((item) => ({
            key: item.id,
            id: item.id,
            type: item.type,
            itemCode: item.itemCode,
            stockId: item.stockId,
            isbnNo: item.isbnNo,
            description: item.description,
            categoryName: item.categoryName,
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
                            <Edit size={14} />
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                        <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDeleteItem(item)}
                        >
                            <Trash2 size={14} />
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
            loadAllItems();
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
            loadAllItems();
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
            loadAllItems();
        } catch (error) {
            handleError(error);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            customToastMsg("Please select items to delete", "warning");
            return;
        }

        customSweetAlert(
            `Do you want to delete ${selectedItems.length} selected items?`,
            0,
            () => bulkDeleteItems(selectedItems)
        );
    };

    const bulkDeleteItems = async (itemCodes) => {
        try {
            popUploader(dispatch, true);
            await itemService.bulkDeleteItems(itemCodes);
            customToastMsg(`${itemCodes.length} items deleted successfully`, 1);
            setSelectedItems([]);
            loadAllItems();
        } catch (error) {
            handleError(error);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            loadAllItems();
            return;
        }

        itemService.searchItems(value)
            .then((res) => {
                const itemData = res.data?.data || [];
                const formattedData = formatItemData(itemData);
                setItemTableList(formattedData);
            })
            .catch((err) => {
                handleError(err);
            });
    };

    const debouncedSearch = useCallback(
        debounce(handleSearch, 300),
        []
    );

    // Handle CSV Export
    const handleExportCSV = () => {
        popUploader(dispatch, true);
        itemService.exportItemsToCSV({
            includeHeaders: true,
            selectedItems: selectedItems.length > 0 ? selectedItems : undefined
        })
            .then((res) => {
                // Create and download CSV file
                const blob = new Blob([res.data], { type: 'text/csv' });
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

    // Row selection configuration
    const rowSelection = {
        selectedRowKeys: selectedItems,
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedItems(selectedRowKeys);
        },
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
                                        <Search size={16} className="me-1" />
                                        Search Items
                                    </Label>
                                    <Input
                                        id="search"
                                        placeholder="Search by description or item code"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            debouncedSearch(e.target.value);
                                        }}
                                    />
                                </FormGroup>
                            </Col>

                            {/*<Col sm={12} md={6} lg={2}>*/}
                            {/*    <Label>Item Type</Label>*/}
                            {/*    <Select*/}
                            {/*        value={selectedType}*/}
                            {/*        onChange={(value) => setSelectedType(value)}*/}
                            {/*        placeholder="Filter by type"*/}
                            {/*        allowClear*/}
                            {/*        style={{ width: '100%' }}*/}
                            {/*    >*/}
                            {/*        <Option value="ITEM">ITEM</Option>*/}
                            {/*        <Option value="SERVICE">SERVICE</Option>*/}
                            {/*        <Option value="RAW_MATERIAL">RAW MATERIAL</Option>*/}
                            {/*        <Option value="CONSUMER_PRODUCT">CONSUMER PRODUCT</Option>*/}
                            {/*    </Select>*/}
                            {/*</Col>*/}

                            <Col sm={12} md={6} lg={2} className="d-flex align-items-end">
                                <Button
                                    color="primary"
                                    className="w-100"
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    <Plus size={16} className="me-1" />
                                    Add Item
                                </Button>
                            </Col>

                            <Col sm={12} md={6} lg={2} className="d-flex align-items-end">
                                <Button
                                    color="success"
                                    outline
                                    className="w-100"
                                    onClick={handleExportCSV}
                                    disabled={itemTableList.length === 0}
                                >
                                    <Download size={16} className="me-1" />
                                    Export CSV
                                </Button>
                            </Col>

                            {/*<Col sm={12} md={6} lg={2} className="d-flex align-items-end">*/}
                            {/*    <Button*/}
                            {/*        color="danger"*/}
                            {/*        outline*/}
                            {/*        className="w-100"*/}
                            {/*        onClick={handleBulkDelete}*/}
                            {/*        disabled={selectedItems.length === 0}*/}
                            {/*    >*/}
                            {/*        <Trash2 size={16} className="me-1" />*/}
                            {/*        Bulk Delete ({selectedItems.length})*/}
                            {/*    </Button>*/}
                            {/*</Col>*/}
                        </Row>

                        {/* Item Table */}
                        <Row>
                            <Col sm={12}>
                                <Table
                                    className="mx-3 my-4"
                                    pagination={false}
                                    columns={ItemTableColumns}
                                    dataSource={itemTableList}
                                    scroll={{ x: "max-content" }}
                                    loading={loading}
                                    locale={{ emptyText: "No items found" }}
                                    rowSelection={rowSelection}
                                />
                            </Col>
                        </Row>
                    </Card>

                    {/* Modal Components */}

                </Container>
            </div>
        </div>

    );
};

export default ItemManagement;