// src/pages/UserManagement/UserManagement.js
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
    message,
    Badge,
    Avatar,
} from "antd";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Shield,
} from "react-feather";
import * as userService from "../../service/userService";
import * as roleService from "../../service/roleService";
import { useDispatch } from "react-redux";
import {
    customToastMsg,
    handleError,
    popUploader,
    customSweetAlert,
} from "../../common/commonFunctions";
import debounce from "lodash.debounce";
import CreateUserModal from "../../Components/Common/modal/User/CreateUserModal";
import UpdateUserModal from "../../Components/Common/modal/User/UpdateUserModal";
import dayjs from "dayjs";

const UserManagement = () => {
    document.title = "User Management | Address Shop";

    const [userTableList, setUserTableList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [roles, setRoles] = useState([]);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const dispatch = useDispatch();

    useEffect(() => {
        loadAllUsers();
        loadRoles();
    }, []);

    // Load all roles for dropdown
    const loadRoles = async () => {
        try {
            const response = await roleService.getAllRoles();
            const rolesData = response.data?.data || response.data || [];
            setRoles(rolesData);
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    // Load all users
    const loadAllUsers = async () => {
        setLoading(true);
        popUploader(dispatch, true);

        try {
            const response = await userService.getAllUsers();
            const usersData = response.data?.data || response.data || [];
            const formattedData = formatUserData(usersData);
            setUserTableList(formattedData);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
            popUploader(dispatch, false);
        }
    };

    // Format user data with actions
    const formatUserData = (userData) => {
        return userData.map((user) => ({
            key: user.id,
            id: user.id,
            userName: user.userName,
            email: user.email,
            mobileNumber: user.mobileNumber || "-",
            contactNumber: user.contactNumber || "-",
            address: user.address || "-",
            age: user.age || "-",
            gender: user.gender || "-",
            role: user.role ? user.role.name : "-",
            roleCode: user.role ? user.role.code : "-",
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            mustChangePassword: user.mustChangePassword,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            action: (
                <Space size="small">
                    <Tooltip title="Edit User">
                        <Button
                            size="sm"
                            color="warning"
                            outline
                            onClick={() => handleEditUser(user)}
                        >
                            <Edit size={14} />
                        </Button>
                    </Tooltip>
                    <Popconfirm
                        title="Delete User"
                        description="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(user)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete User">
                            <Button size="sm" color="danger" outline>
                                <Trash2 size={14} />
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }));
    };

    // Handle create user
    const handleCreateUser = async (values) => {
        try {
            setModalLoading(true);
            const response = await userService.createUser(values);
            customToastMsg("User created successfully", 1);
            setCreateModalVisible(false);
            loadAllUsers();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle edit user
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUpdateModalVisible(true);
    };

    // Handle update user
    const handleUpdateUser = async (values) => {
        try {
            setModalLoading(true);
            await userService.updateUser(selectedUser.id, values);
            customToastMsg("User updated successfully", 1);
            setUpdateModalVisible(false);
            loadAllUsers();
        } catch (error) {
            handleError(error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (user) => {
        try {
            popUploader(dispatch, true);
            await userService.deleteUser(user.id);
            customToastMsg("User deleted successfully", 1);
            loadAllUsers();
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
            loadAllUsers();
            return;
        }

        // Filter users based on search term
        userService
            .getAllUsers()
            .then((response) => {
                const usersData = response.data?.data || response.data || [];
                const filteredData = usersData.filter(
                    (user) =>
                        user.userName?.toLowerCase().includes(value.toLowerCase()) ||
                        user.email?.toLowerCase().includes(value.toLowerCase()) ||
                        user.mobileNumber?.includes(value) ||
                        user.contactNumber?.includes(value)
                );
                const formattedData = formatUserData(filteredData);
                setUserTableList(formattedData);
            })
            .catch((error) => {
                handleError(error);
            });
    };

    const debouncedSearch = useCallback(debounce(handleSearch, 300), []);

    // Table columns
    const columns = [
        {
            title: "User",
            key: "user",
            width: 200,
            render: (_, record) => (
                <div className="d-flex align-items-center">
                    <Avatar
                        icon={<User size={16} />}
                        style={{ backgroundColor: "#1890ff", marginRight: 8 }}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.userName}</div>
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Contact",
            key: "contact",
            width: 150,
            render: (_, record) => (
                <div>
                    {record.mobileNumber !== "-" && (
                        <div>
                            <Phone size={12} style={{ marginRight: 4 }} />
                            {record.mobileNumber}
                        </div>
                    )}
                    {record.contactNumber !== "-" && (
                        <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                            {record.contactNumber}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Role",
            key: "role",
            width: 150,
            render: (_, record) => (
                <Tag color="blue" icon={<Shield size={12} />}>
                    {record.role}
                </Tag>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Badge
                        status={record.isActive ? "success" : "default"}
                        text={record.isActive ? "Active" : "Inactive"}
                    />
                    {record.isEmailVerified && (
                        <Tag color="green" size="small">
                            Verified
                        </Tag>
                    )}
                </Space>
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
                    <h4>User Management</h4>
                </div>

                <Card>
                    {/* Search and Action Section */}
                    <Row className="mt-4 mx-2">
                        <Col sm={12} md={6} lg={4}>
                            <FormGroup>
                                <Label for="search">
                                    <Search size={16} className="me-1" />
                                    Search Users
                                </Label>
                                <Input
                                    id="search"
                                    placeholder="Search by name, email, or phone"
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
                                Add User
                            </Button>
                        </Col>
                    </Row>

                    {/* User Table */}
                    <Row>
                        <Col sm={12}>
                            <Table
                                className="mx-3 my-4"
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Total ${total} users`,
                                }}
                                columns={columns}
                                dataSource={userTableList}
                                scroll={{ x: "max-content" }}
                                loading={loading}
                                locale={{ emptyText: "No users found" }}
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Modal Components */}
                <CreateUserModal
                    visible={createModalVisible}
                    onClose={() => setCreateModalVisible(false)}
                    onCreate={handleCreateUser}
                    loading={modalLoading}
                    roles={roles}
                />

                <UpdateUserModal
                    visible={updateModalVisible}
                    user={selectedUser}
                    onClose={() => setUpdateModalVisible(false)}
                    onUpdate={handleUpdateUser}
                    loading={modalLoading}
                    roles={roles}
                />
            </Container>
        </div>
    );
};

export default UserManagement;

