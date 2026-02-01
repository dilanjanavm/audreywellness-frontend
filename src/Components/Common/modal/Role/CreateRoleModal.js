// src/Components/Common/modal/Role/CreateRoleModal.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Switch, Checkbox, Steps, message } from "antd";
import { Shield, FileText, Key, CheckCircle } from "react-feather";
import * as permissionService from "../../../../service/permissionService";
import * as roleService from "../../../../service/roleService";

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

const CreateRoleModal = ({
    visible,
    onClose,
    onCreate,
    loading = false,
}) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [groupedPermissions, setGroupedPermissions] = useState({});
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [createdRoleId, setCreatedRoleId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            loadPermissionsGrouped();
            form.resetFields();
            setSelectedPermissions([]);
            setCurrentStep(0);
            setCreatedRoleId(null);
        }
    }, [visible, form]);

    const loadPermissionsGrouped = async () => {
        try {
            setLoadingPermissions(true);
            const response = await permissionService.getPermissionsGroupedByModule();
            // Response structure: { data: { modules: { moduleName: [permissions] }, totalPermissions, totalModules } }
            const modulesData = response.data?.data?.modules || response.data?.modules || {};
            setGroupedPermissions(modulesData);
        } catch (error) {
            console.error("Error loading permissions:", error);
            message.error("Failed to load permissions");
        } finally {
            setLoadingPermissions(false);
        }
    };

    // Step 1: Create Role
    const handleCreateRole = async (values) => {
        try {
            setSubmitting(true);
            const roleData = {
                name: values.name,
                code: values.code?.toUpperCase().replace(/\s+/g, "_"),
                description: values.description,
                isActive: values.isActive !== undefined ? values.isActive : true,
            };

            const response = await roleService.createRole(roleData);
            const createdRole = response.data?.data?.data || response.data?.data || response.data;
            setCreatedRoleId(createdRole.id);
            setCurrentStep(1); // Move to permission selection step
            message.success("Role created successfully! Now assign permissions.");
        } catch (error) {
            console.error("Error creating role:", error);
            message.error(error.response?.data?.message || "Failed to create role");
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2: Assign Permissions
    const handleAssignPermissions = async () => {
        if (!createdRoleId) {
            message.error("Role ID is missing");
            return;
        }

        try {
            setSubmitting(true);
            const response = await roleService.assignPermissionsToRole(createdRoleId, {
                permissionIds: selectedPermissions,
            });
            message.success("Permissions assigned successfully!");
            onCreate && onCreate();
            handleClose();
        } catch (error) {
            console.error("Error assigning permissions:", error);
            message.error(error.response?.data?.message || "Failed to assign permissions");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedPermissions([]);
        setCurrentStep(0);
        setCreatedRoleId(null);
        onClose();
    };

    const handleNext = () => {
        form.validateFields().then((values) => {
            handleCreateRole(values);
        });
    };

    const handleSelectAll = (module) => {
        const modulePermissions = groupedPermissions[module] || [];
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        setSelectedPermissions((prev) => {
            const newSelected = [...prev];
            modulePermissionIds.forEach((id) => {
                if (!newSelected.includes(id)) {
                    newSelected.push(id);
                }
            });
            return newSelected;
        });
    };

    const handleDeselectAll = (module) => {
        const modulePermissions = groupedPermissions[module] || [];
        const modulePermissionIds = modulePermissions.map((p) => p.id);
        setSelectedPermissions((prev) => prev.filter((id) => !modulePermissionIds.includes(id)));
    };

    return (
        <Modal
            title={
                <div className="d-flex align-items-center">
                    <Shield size={20} className="me-2" />
                    Create New Role
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={800}
            className="create-role-modal"
        >
            <Steps current={currentStep} className="mb-4">
                <Step title="Create Role" icon={<Shield size={16} />} />
                <Step title="Assign Permissions" icon={<Key size={16} />} />
            </Steps>

            {currentStep === 0 && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleNext}
                    requiredMark="optional"
                >
                    <Row gutter={16}>
                        {/* Role Name */}
                        <Col span={12}>
                            <Form.Item
                                label="Role Name"
                                name="name"
                                rules={[
                                    { required: true, message: "Please enter role name" },
                                    { min: 2, message: "Role name must be at least 2 characters" },
                                ]}
                            >
                                <Input
                                    prefix={<Shield size={16} />}
                                    placeholder="e.g., Manager"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>

                        {/* Role Code */}
                        <Col span={12}>
                            <Form.Item
                                label="Role Code"
                                name="code"
                                rules={[
                                    { required: true, message: "Please enter role code" },
                                    {
                                        pattern: /^[A-Z_]+$/,
                                        message: "Code must be uppercase letters and underscores only",
                                    },
                                ]}
                                tooltip="Uppercase letters and underscores only (e.g., MANAGER, ADMIN)"
                            >
                                <Input
                                    placeholder="e.g., MANAGER"
                                    size="large"
                                    onChange={(e) => {
                                        const value = e.target.value.toUpperCase().replace(/\s+/g, "_");
                                        form.setFieldsValue({ code: value });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Description */}
                    <Form.Item label="Description" name="description">
                        <TextArea
                            rows={3}
                            placeholder="Enter role description"
                            prefix={<FileText size={16} />}
                        />
                    </Form.Item>

                    {/* Is Active */}
                    <Form.Item
                        label="Status"
                        name="isActive"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>

                    {/* Form Actions */}
                    <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                        <Button size="large" onClick={handleClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={submitting}
                            className="px-4"
                        >
                            Next: Assign Permissions
                        </Button>
                    </div>
                </Form>
            )}

            {currentStep === 1 && (
                <div>
                    <div className="mb-3">
                        <h5>Select Permissions for this Role</h5>
                        <p style={{ color: "#8c8c8c", fontSize: "13px" }}>
                            Choose the permissions you want to assign to this role. Permissions are grouped by module.
                        </p>
                    </div>

                    {loadingPermissions ? (
                        <div className="text-center py-4">Loading permissions...</div>
                    ) : (
                        <div
                            style={{
                                maxHeight: "400px",
                                overflowY: "auto",
                                border: "1px solid #d9d9d9",
                                borderRadius: "4px",
                                padding: "16px",
                            }}
                        >
                            {Object.keys(groupedPermissions).length === 0 ? (
                                <div className="text-center py-4">No permissions available</div>
                            ) : (
                                Object.keys(groupedPermissions).map((module) => {
                                    const modulePermissions = groupedPermissions[module] || [];
                                    const modulePermissionIds = modulePermissions.map((p) => p.id);
                                    const allSelected = modulePermissionIds.every((id) =>
                                        selectedPermissions.includes(id)
                                    );
                                    const someSelected = modulePermissionIds.some((id) =>
                                        selectedPermissions.includes(id)
                                    );

                                    return (
                                        <div key={module} style={{ marginBottom: "24px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "12px",
                                                    paddingBottom: "8px",
                                                    borderBottom: "1px solid #f0f0f0",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: "15px",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {module} ({modulePermissions.length})
                                                </div>
                                                <div>
                                                    <Button
                                                        size="small"
                                                        type="link"
                                                        onClick={() =>
                                                            allSelected
                                                                ? handleDeselectAll(module)
                                                                : handleSelectAll(module)
                                                        }
                                                    >
                                                        {allSelected ? "Deselect All" : "Select All"}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Checkbox.Group
                                                value={selectedPermissions}
                                                onChange={(checkedValues) => {
                                                    // When Checkbox.Group onChange is called, it provides only the checked values
                                                    // We need to merge with existing selections from other modules
                                                    const otherModuleIds = Object.keys(groupedPermissions)
                                                        .filter((mod) => mod !== module)
                                                        .flatMap((mod) => 
                                                            (groupedPermissions[mod] || []).map((p) => p.id)
                                                        );
                                                    
                                                    // Keep selections from other modules
                                                    const otherModuleSelections = selectedPermissions.filter((id) =>
                                                        otherModuleIds.includes(id)
                                                    );
                                                    
                                                    // Combine with current module selections
                                                    setSelectedPermissions([...otherModuleSelections, ...checkedValues]);
                                                }}
                                                style={{ width: "100%" }}
                                            >
                                                <Row gutter={[16, 8]}>
                                                    {modulePermissions.map((permission) => (
                                                        <Col span={12} key={permission.id}>
                                                            <Checkbox value={permission.id}>
                                                                <div>
                                                                    <div style={{ fontWeight: 500 }}>
                                                                        {permission.name}
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            fontSize: "11px",
                                                                            color: "#8c8c8c",
                                                                        }}
                                                                    >
                                                                        {permission.code}
                                                                    </div>
                                                                </div>
                                                            </Checkbox>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Checkbox.Group>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="d-flex justify-content-between gap-3 mt-4 pt-3 border-top">
                        <Button
                            size="large"
                            onClick={() => setCurrentStep(0)}
                            disabled={submitting}
                        >
                            Back
                        </Button>
                        <div className="d-flex gap-3">
                            <Button size="large" onClick={handleClose} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                loading={submitting}
                                onClick={handleAssignPermissions}
                                className="px-4"
                                icon={<CheckCircle size={16} />}
                            >
                                Complete & Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CreateRoleModal;
