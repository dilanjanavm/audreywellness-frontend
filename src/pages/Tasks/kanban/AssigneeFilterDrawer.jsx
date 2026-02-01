import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, Input, Avatar, Checkbox, Typography, Space, Empty, Spin } from 'antd';
import { UserOutlined, TeamOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import * as userService from '../../../service/userService';

const { Title, Text } = Typography;

const AssigneeFilterDrawer = ({ 
    visible, 
    onClose, 
    selectedAssignees = [], 
    onSelectAssignees,
    tasks = [] 
}) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [localSelected, setLocalSelected] = useState(selectedAssignees);

    // Load users when drawer opens
    useEffect(() => {
        if (visible) {
            loadUsers();
            setLocalSelected(selectedAssignees);
        }
    }, [visible, selectedAssignees]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            
            // Handle different response structures
            let usersList = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    usersList = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    usersList = response.data.data;
                } else if (response.data.users && Array.isArray(response.data.users)) {
                    usersList = response.data.users;
                }
            }

            // Transform users to consistent format
            const transformedUsers = usersList.map(user => ({
                id: user.id || user._id,
                name: user.userName || user.name || user.username || user.fullName || 'Unknown',
                email: user.email || '',
                avatar: user.avatar || user.profilePicture || user.image,
                role: user.role?.name || user.role?.code || user.role || null,
            }));

            setUsers(transformedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate task counts per assignee
    const assigneeTaskCounts = useMemo(() => {
        const counts = {};
        const unassignedCount = { count: 0 };

        tasks.forEach(task => {
            // Check if task has assignees
            let hasAssignees = false;

            // Handle different assignee structures
            if (task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0) {
                task.assignees.forEach(assignee => {
                    const assigneeId = assignee.id || assignee._id || assignee;
                    if (assigneeId) {
                        counts[assigneeId] = (counts[assigneeId] || 0) + 1;
                        hasAssignees = true;
                    }
                });
            } else if (task.assignedUser) {
                const assigneeId = task.assignedUser.id || task.assignedUser._id || task.assignedUserId;
                if (assigneeId) {
                    counts[assigneeId] = (counts[assigneeId] || 0) + 1;
                    hasAssignees = true;
                }
            } else if (task.assignee) {
                const assigneeId = typeof task.assignee === 'object' 
                    ? (task.assignee.id || task.assignee._id) 
                    : task.assignee;
                if (assigneeId) {
                    counts[assigneeId] = (counts[assigneeId] || 0) + 1;
                    hasAssignees = true;
                }
            } else if (task.assignedUserId) {
                counts[task.assignedUserId] = (counts[task.assignedUserId] || 0) + 1;
                hasAssignees = true;
            }

            if (!hasAssignees) {
                unassignedCount.count += 1;
            }
        });

        return { counts, unassignedCount: unassignedCount.count };
    }, [tasks]);

    // Filter users based on search query
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) {
            return users;
        }

        const query = searchQuery.toLowerCase();
        return users.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    const handleCheckboxChange = (userId, checked) => {
        if (checked) {
            setLocalSelected([...localSelected, userId]);
        } else {
            setLocalSelected(localSelected.filter(id => id !== userId));
        }
    };

    const handleApply = () => {
        onSelectAssignees(localSelected);
        onClose();
    };

    const handleClear = () => {
        setLocalSelected([]);
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name[0].toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return '#1890ff';
        const colors = [
            '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
            '#ff7875', '#52c41a', '#1890ff', '#fa8c16',
            '#eb2f96', '#722ed1', '#13c2c2', '#faad14'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={5} style={{ margin: 0 }}>Assignees</Title>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: '#8c8c8c',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <CloseOutlined />
                    </button>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={visible}
            width={360}
            styles={{
                body: {
                    padding: 0,
                }
            }}
            extra={
                <Space>
                    {localSelected.length > 0 && (
                        <button
                            onClick={handleClear}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#1890ff',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: 14
                            }}
                        >
                            Clear
                        </button>
                    )}
                    <button
                        onClick={handleApply}
                        style={{
                            background: '#1890ff',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px 16px',
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 500
                        }}
                    >
                        Apply
                    </button>
                </Space>
            }
        >
            <div style={{ padding: '16px' }}>
                {/* Search Bar */}
                <Input
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    placeholder="Search by user or team"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        marginBottom: 16,
                        borderRadius: 8,
                        borderColor: '#d9d9d9'
                    }}
                    allowClear
                />

                {/* People Section */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#595959'
                    }}>
                        <UserOutlined style={{ marginRight: 8, fontSize: 16 }} />
                        <span>People {users.length}</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div>
                            {/* Unassigned Option */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 8px',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                onClick={() => {
                                    const isUnassignedSelected = localSelected.includes('unassigned');
                                    handleCheckboxChange('unassigned', !isUnassignedSelected);
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <Avatar
                                        icon={<TeamOutlined />}
                                        style={{
                                            backgroundColor: '#f0f0f0',
                                            color: '#8c8c8c',
                                            marginRight: 12
                                        }}
                                        size={32}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ 
                                            fontSize: 14, 
                                            fontWeight: 500,
                                            color: '#262626',
                                            marginBottom: 2
                                        }}>
                                            Unassigned
                                        </div>
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12, marginRight: 12 }}>
                                        {assigneeTaskCounts.unassignedCount || 0}
                                    </Text>
                                </div>
                                <Checkbox
                                    checked={localSelected.includes('unassigned')}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleCheckboxChange('unassigned', e.target.checked);
                                    }}
                                />
                            </div>

                            {/* Users List */}
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const taskCount = assigneeTaskCounts.counts[user.id] || 0;
                                    const isSelected = localSelected.includes(user.id);

                                    return (
                                        <div
                                            key={user.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '12px 8px',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            onClick={() => handleCheckboxChange(user.id, !isSelected)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                <Avatar
                                                    src={
                                                        user.avatar
                                                            ? `${process.env.REACT_APP_API_URL || ''}/images/users/${user.avatar}`
                                                            : undefined
                                                    }
                                                    icon={!user.avatar ? <UserOutlined /> : undefined}
                                                    style={{
                                                        backgroundColor: !user.avatar ? getAvatarColor(user.name) : undefined,
                                                        color: !user.avatar ? 'white' : undefined,
                                                        marginRight: 12
                                                    }}
                                                    size={32}
                                                >
                                                    {!user.avatar && getInitials(user.name)}
                                                </Avatar>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ 
                                                        fontSize: 14, 
                                                        fontWeight: 500,
                                                        color: '#262626',
                                                        marginBottom: 2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {user.name}
                                                    </div>
                                                    {user.email && (
                                                        <div style={{ 
                                                            fontSize: 12, 
                                                            color: '#8c8c8c',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {user.email}
                                                        </div>
                                                    )}
                                                </div>
                                                <Text type="secondary" style={{ fontSize: 12, marginRight: 12 }}>
                                                    {taskCount}
                                                </Text>
                                            </div>
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleCheckboxChange(user.id, e.target.checked);
                                                }}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <Empty
                                    description={
                                        searchQuery ? `No users found matching "${searchQuery}"` : "No users available"
                                    }
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ padding: '40px 0' }}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Teams Section (Placeholder for future implementation) */}
                <div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#595959'
                    }}>
                        <TeamOutlined style={{ marginRight: 8, fontSize: 16 }} />
                        <span>Teams 0</span>
                    </div>
                    <Empty
                        description="No teams available"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '20px 0' }}
                        imageStyle={{ height: 40 }}
                    />
                </div>
            </div>
        </Drawer>
    );
};

export default AssigneeFilterDrawer;
