// src/modules/category/CategoryManagement.js
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
import {Table, Tag, Tooltip} from "antd";
import {Plus, Search, Edit, Trash2, Eye} from "react-feather";

import * as categoryService from "../../service/categoryService";
import {useDispatch} from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateCategoryModal from "../../Components/Common/modal/CreateCategoryModal";
import UpdateCategoryModal from "../../Components/Common/modal/UpdateCategoryModal";
import {CategoryTableColumns} from "../../common/tableColumns";

// Import Modal Components


const CategoryManagement = () => {
    document.title = "Categories | Address Shop";

    const [categoryTableList, setCategoryTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllCategories();
    }, []);

    // Load all categories
    const loadAllCategories = () => {
        setLoading(true);
        popUploader(dispatch, true);

        categoryService.getAllCategories()
            .then((res) => {
                console.log(res)
                const categoryData = res.data.data || [];
                console.log(categoryData.data)
                const formattedData = formatCategoryData(categoryData.data);

                setCategoryTableList(formattedData);
                setLoading(false);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                setLoading(false);
                popUploader(dispatch, false);
                handleError(err);
            });
    };

    // Format category data with actions
    const formatCategoryData = (categoryData) => {
        return categoryData.map((category) => ({
            key: category.id,
            id: category.id,
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            categoryDesc: category.categoryDesc,
            categoryColor: category.categoryColor,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            action: (
                <div className="d-flex gap-2">
                    <Tooltip title="Edit Category">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditCategory(category)}
                        >
                            <Edit size={14}/>
                        </Button>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                        <Button
                            size="sm"
                            color="danger"
                            outline
                            onClick={() => handleDeleteCategory(category)}
                        >
                            <Trash2 size={14}/>
                        </Button>
                    </Tooltip>
                </div>
            )
        }));
    };

    // Handle create category
    const handleCreateCategory = async (values) => {
        try {
            setModalLoading(true);
            await categoryService.createCategory(values);
            customToastMsg('Category created successfully', 'success');
            setCreateModalVisible(false);
            loadAllCategories();
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle edit category
    const handleEditCategory = (category) => {
        setSelectedCategory(category);
        setUpdateModalVisible(true);
    };

    // Handle update category
    const handleUpdateCategory = async (values) => {
        try {
            setModalLoading(true);
            await categoryService.updateCategory(selectedCategory.categoryId, values);
            customToastMsg('Category updated successfully', 'success');
            setUpdateModalVisible(false);
            loadAllCategories();
            setModalLoading(false);
        } catch (error) {
            setModalLoading(false);
            handleError(error);
        }
    };

    // Handle delete category
    const handleDeleteCategory = (category) => {
        customSweetAlert(
            `Do you want to delete category "${category.categoryName}"?`,
            0,
            () => deleteCategory(category.categoryId)
        );
    };

    const deleteCategory = async (categoryId) => {
        try {
            popUploader(dispatch, true);
            await categoryService.deleteCategory(categoryId);
            customToastMsg("Category deleted successfully", 1);
            loadAllCategories();
        } catch (error) {
            handleError(error);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            loadAllCategories();
            return;
        }

        const filteredData = categoryTableList.filter(category =>
            category.categoryId.toLowerCase().includes(value.toLowerCase()) ||
            category.categoryName.toLowerCase().includes(value.toLowerCase()) ||
            category.categoryDesc.toLowerCase().includes(value.toLowerCase())
        );

        setCategoryTableList(filteredData);
    };

    const debouncedSearch = useCallback(
        debounce(handleSearch, 300),
        [categoryTableList]
    );

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Category Management</h4>
                </div>

                <Card>
                    {/* Search and Action Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1"/>
                                    Search Categories
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by ID, name, or description"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={4} className="d-flex align-items-end">
                            <Button
                                color="primary"
                                className="w-100"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                <Plus size={16} className="me-1"/>
                                Add Category
                            </Button>
                        </Col>
                    </Row>

                    {/* Category Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={false}
                                columns={CategoryTableColumns}
                                dataSource={categoryTableList}
                                scroll={{x: "max-content"}}
                                loading={loading}
                                locale={{emptyText: "No categories found"}}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreateCategoryModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateCategory}
                    loading={modalLoading}
                />

                <UpdateCategoryModal
                    visible={updateModalVisible}
                    category={selectedCategory}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdateCategory}
                    loading={modalLoading}
                />
            </Container>
        </div>
    );
};

export default CategoryManagement;