// src/pages/RoleAndPermission/RoleManagementNew.js
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
} from "antd";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Shield,
    Key,
} from "react-feather";
import * as roleService from "../../service/roleService";
import * as permissionService from "../../service/permissionService";
import { useDispatch } from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateRoleModal from "../../Components/Common/modal/Role/CreateRoleModal";
import UpdateRoleModal from "../../Components/Common/modal/Role/UpdateRoleModal";
import dayjs from "dayjs";

const RoleManagement = () => {
    document.title = "Role Management | Address Shop";

    const [roleTableList, setRoleTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [permissions, setPermissions] = useState([]);
    const [allRolesList, setAllRolesList] = useState([]);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllRoles();
    }, []);

    useEffect(() => {
        loadPermissions();
    }, []);

    // Load all permissions for assignment
    const loadPermissions = async () => {
        try {
            const response = await permissionService.getAllPermissions();
            setPermissions(response.data?.data || response.data || []);
        } catch (error) {
            console.error("Error loading permissions:", error);
        }
    };

    // Load all roles
    const loadAllRoles = async () => {
        setLoading(true);
        popUploader(dispatch, true);

        try {
            const response = await roleService.getAllRoles();
            const rolesData = response.data?.data || response.data || [];
            setAllRolesList(rolesData); // Store original roles data
            const formattedData = formatRoleData(rolesData);
            setRoleTableList(formattedData);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
            popUploader(dispatch, false);
        }
    };

    // Format role data with actions
    const formatRoleData = (roleData) => {
        return roleData.map((role) => ({
            key: role.id,
            id: role.id,
            name: role.name,
            code: role.code,
            description: role.description || "-",
            isActive: role.isActive,
            permissionsCount: role.permissions ? role.permissions.length : 0,
            permissions: role.permissions || [],
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            action: (
                <Space size="small">
                    <Tooltip title="Edit Role">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditRole(role)}
                        >
                            <Edit size={14} />
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete Role"
                        description="Are you sure you want to delete this role?"
                        onConfirm={() => handleDeleteRole(role)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete Role">
                            <Button size="sm" color="danger" outline>
                                <Trash2 size={14} />
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }));
    };

    // Handle create role
    const handleCreateRole = async (values) => {
        try {
            setModalLoading(true);
            await roleService.createRole(values);
            customToastMsg("Role created successfully", 1);
            setCreateModalVisible(false);
            loadAllRoles();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit role
    const handleEditRole = (role) => {
        setSelectedRole(role);
        setUpdateModalVisible(true);
    };

    // Handle update role
    const handleUpdateRole = async (values) => {
        try {
            setModalLoading(true);
            await roleService.updateRole(selectedRole.id, values);
            customToastMsg("Role updated successfully", 1);
            setUpdateModalVisible(false);
            loadAllRoles();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle delete role
    const handleDeleteRole = async (role) => {
        try {
            popUploader(dispatch, true);
            await roleService.deleteRole(role.id);
            customToastMsg("Role deleted successfully", 1);
            loadAllRoles();
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
            loadAllRoles();
            return;
        }

        // Filter roles based on search term
        roleService
            .getAllRoles()
            .then((response) => {
                const rolesData = response.data?.data || response.data || [];
                const filteredData = rolesData.filter(
                    (role) =>
                        role.name?.toLowerCase().includes(value.toLowerCase()) ||
                        role.code?.toLowerCase().includes(value.toLowerCase()) ||
                        role.description?.toLowerCase().includes(value.toLowerCase())
                );
                const formattedData = formatRoleData(filteredData);
                setRoleTableList(formattedData);
            })
            .catch((error) => {
                handleError(error);
            });
    };

    const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

    // Table columns
    const columns = [
        {
            title: "Role",
            key: "role",
            width: 200,
            render: (_, record) => (
                <div className="d-flex align-items-center">
                    <Avatar
                        icon={<Shield size={16} />}
                        style={{ backgroundColor: "#52c41a", marginRight: 8 }}
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
            title: "Description",
            key: "description",
            width: 250,
            render: (_, record) => (
                <div style={{ fontSize: "13px" }}>{record.description}</div>
            ),
        },
        {
            title: "Permissions",
            key: "permissions",
            width: 150,
            render: (_, record) => (
                <Tag color="blue" icon={<Key size={12} />}>
                    {record.permissionsCount} Permission{record.permissionsCount !== 1 ? "s" : ""}
                </Tag>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: 100,
            render: (_, record) => (
                <Badge
                    status={record.isActive ? "success" : "default"}
                    text={record.isActive ? "Active" : "Inactive"}
                />
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
                    <h4>Role Management</h4>
                </div>

                <Card>
                    {/* Search and Action Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1" />
                                    Search Roles
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, code, or description"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        debouncedSearch(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </Col>

                        <Col sm={12} md={6} lg={4} className="">
                            <Label className="opacity-0">Action</Label>
                            <Button
                                color="primary"
                                className="w-100"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                <Plus size={16} className="me-1" />
                                Add Role
                            </Button>
                        </Col>
                    </Row>

                    {/* Role Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} roles`,
                                }}
                                columns={columns}
                                dataSource={roleTableList}
                                scroll={{ x: "max-content" }}
                                loading={loading}
                                locale={{ emptyText: "No roles found" }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreateRoleModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateRole}
                    loading={modalLoading}
                />

                <UpdateRoleModal
                    visible={updateModalVisible}
                    role={selectedRole}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdateRole}
                    loading={modalLoading}
                    roles={allRolesList}
                />
            </Container>
        </div>
    );
};

export default RoleManagement;

