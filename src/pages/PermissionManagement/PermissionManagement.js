// src/pages/PermissionManagement/PermissionManagement.js
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
import {
    Table,
    Tag,
    Tooltip,
    Space,
    Popconfirm,
    Badge,
    Avatar,
    Select,
} from "antd";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Key,
    Folder,
} from "react-feather";
import * as permissionService from "../../service/permissionService";
import { useDispatch } from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreatePermissionModal from "../../Components/Common/modal/Permission/CreatePermissionModal";
import UpdatePermissionModal from "../../Components/Common/modal/Permission/UpdatePermissionModal";
import dayjs from "dayjs";

const { Option } = Select;

const PermissionManagement = () => {
    document.title = "Permission Management | Address Shop";

    const [permissionTableList, setPermissionTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modules, setModules] = useState([]);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllPermissions();
    }, [selectedModule]);

    // Load all permissions
    const loadAllPermissions = async () => {
        setLoading(true);
        popUploader(dispatch, true);

        try {
            const response = selectedModule
                ? await permissionService.getPermissionsByModule(selectedModule)
                : await permissionService.getAllPermissions();
            const permissionsData = response.data?.data || response.data || [];
            const formattedData = formatPermissionData(permissionsData);
            setPermissionTableList(formattedData);

            // Extract unique modules
            const uniqueModules = [
                ...new Set(permissionsData.map((p) => p.module).filter(Boolean)),
            ];
            setModules(uniqueModules);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
            popUploader(dispatch, false);
        }
    };

    // Format permission data with actions
    const formatPermissionData = (permissionData) => {
        return permissionData.map((permission) => ({
            key: permission.id,
            id: permission.id,
            name: permission.name,
            code: permission.code,
            description: permission.description || "-",
            module: permission.module || "-",
            createdAt: permission.createdAt,
            updatedAt: permission.updatedAt,
            action: (
                <Space size="small">
                    <Tooltip title="Edit Permission">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditPermission(permission)}
                        >
                            <Edit size={14} />
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete Permission"
                        description="Are you sure you want to delete this permission? This action cannot be undone."
                        onConfirm={() => handleDeletePermission(permission)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Permission">
                            <Button size="sm" color="danger" outline>
                                <Trash2 size={14} />
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }));
    };

    // Handle create permission
    const handleCreatePermission = async (values) => {
        try {
            setModalLoading(true);
            await permissionService.createPermission(values);
            customToastMsg("Permission created successfully", 1);
            setCreateModalVisible(false);
            loadAllPermissions();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit permission
    const handleEditPermission = (permission) => {
        setSelectedPermission(permission);
        setUpdateModalVisible(true);
    };

    // Handle update permission
    const handleUpdatePermission = async (values) => {
        try {
            setModalLoading(true);
            await permissionService.updatePermission(selectedPermission.id, values);
            customToastMsg("Permission updated successfully", 1);
            setUpdateModalVisible(false);
            loadAllPermissions();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle delete permission
    const handleDeletePermission = async (permission) => {
        try {
            popUploader(dispatch, true);
            await permissionService.deletePermission(permission.id);
            customToastMsg("Permission deleted successfully", 1);
            loadAllPermissions();
        } catch (error) {
            handleError(error);
        } finally {
            popUploader(dispatch, false);
        }
    };

    // Search functionality
    const handleSearch = (value) => {
        setSearchTerm(value);

        if (!value.trim()) {
            loadAllPermissions();
            return;
        }

        // Filter permissions based on search term
        const filteredData = permissionTableList.filter(
            (permission) =>
                permission.name?.toLowerCase().includes(value.toLowerCase()) ||
                permission.code?.toLowerCase().includes(value.toLowerCase()) ||
                permission.module?.toLowerCase().includes(value.toLowerCase()) ||
                permission.description?.toLowerCase().includes(value.toLowerCase())
        );
        setPermissionTableList(filteredData);
    };

    const debouncedSearch = useCallback(debounce(handleSearch, 300), [permissionTableList]);

    // Table columns
    const columns = [
        {
            title: "Permission",
            key: "permission",
            width: 250,
            render: (_, record) => (
                <div className="d-flex align-items-center">
                    <Avatar
                        icon={<Key size={16} />}
                        style={{ backgroundColor: "#722ed1", marginRight: 8 }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.name}</div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.code}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Module",
            key: "module",
            width: 150,
            render: (_, record) => (
                <Tag color="purple" icon={<Folder size={12} />}>
                    {record.module}
                </Tag>
            ),
        },
        {
            title: "Description",
            key: "description",
            width: 300,
            render: (_, record) => (
                <div style={{ fontSize: "13px" }}>{record.description}</div>
            ),
        },
        {
            title: "Created",
            key: "createdAt",
            width: 120,
            render: (_, record) =>
                record.createdAt
                    ? dayjs(record.createdAt).format("YYYY-MM-DD")
                    : "-",
        },
        {
            title: "Actions",
            key: "action",
            width: 120,
            fixed: "right",
            render: (_, record) => record.action,
        },
    ];

    return (
        <div className="page-content">
            <Container fluid>
                <div className="row mt-3">
                    <h4>Permission Management</h4>
                </div>

                <Card>
                    {/* Search and Action Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1" />
                                    Search Permissions
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, code, or module"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={4} lg={3}>
                            <FormGroup>
                                <Label for="module">
                                    <Folder size={16} className="me-1" />
                                    Filter by Module
                                </Label>
                                <Select
                                    id="module"
                                    placeholder="All Modules"
                                    allowClear
                                    value={selectedModule}
                                    onChange={(value) => {
                                        setSelectedModule(value);
                                        setSearchTerm("");
                                    }}
                                    style={{ width: "100%" }}
                                >
                                    {modules.map((module) => (
                                        <Option key={module} value={module}>
                                            {module}
                                        </Option>
                                    ))}
                                </Select>
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={3} className="">
                            <Label className="opacity-0">Action</Label>
                            <Button
                                color="primary"
                                className="w-100"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                <Plus size={16} className="me-1" />
                                Add Permission
                            </Button>
                        </Col>
                    </Row>

                    {/* Permission Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} permissions`,
                                }}
                                columns={columns}
                                dataSource={permissionTableList}
                                scroll={{ x: "max-content" }}
                                loading={loading}
                                locale={{ emptyText: "No permissions found" }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreatePermissionModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreatePermission}
                    loading={modalLoading}
                    modules={modules}
                />

                <UpdatePermissionModal
                    visible={updateModalVisible}
                    permission={selectedPermission}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdatePermission}
                    loading={modalLoading}
                    modules={modules}
                />
            </Container>
        </div>
    );
};

export default PermissionManagement;

