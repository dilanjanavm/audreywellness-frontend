import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';
import { List, Avatar, Button, Empty, Spin, message, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import SimpleBar from "simplebar-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';
import * as taskService from '../../../service/taskService';

const Comments = ({ task }) => {
    const [activeTab, setActiveTab] = useState('1');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        if (task?.id) {
            loadComments();
        }
    }, [task]);

    const loadComments = async () => {
        if (!task?.id) return;
        
        try {
            setLoading(true);
            const response = await taskService.getTaskComments(task.id || task._id);
            
            let commentsData = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    commentsData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    commentsData = response.data.data;
                }
            }
            
            const transformedComments = commentsData.map(comment => ({
                id: comment.id,
                comment: comment.comment,
                ownerId: comment.ownerId,
                owner: comment.owner || null,
                ownerName: comment.ownerName || comment.owner?.userName || comment.owner?.name || 'Unknown',
                ownerEmail: comment.ownerEmail || comment.owner?.email || '',
                commentedDate: comment.commentedDate || comment.createdAt,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
            }));
            
            setComments(transformedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
            message.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handlePostComment = async () => {
        if (!commentContent.trim() || !commentContent.replace(/<[^>]*>/g, '').trim()) {
            message.warning('Please enter a comment');
            return;
        }
        
        if (!task?.id) {
            message.error('Task not found');
            return;
        }

        try {
            setSubmitting(true);
            
            const currentUser = JSON.parse(sessionStorage.getItem('authUser') || '{}');
            const currentUserId = currentUser.user?.id || currentUser.user?._id || currentUser.id || currentUser._id;
            
            const commentData = {
                comment: commentContent,
            };
            
            if (currentUserId) {
                commentData.ownerId = currentUserId;
            }
            
            await taskService.addTaskComment(task.id || task._id, commentData);
            
            setCommentContent('');
            await loadComments();
            
            message.success('Comment added successfully');
        } catch (error) {
            console.error('Error adding comment:', error);
            message.error(error.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await taskService.deleteTaskComment(commentId);
            message.success('Comment deleted successfully');
            await loadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            message.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    const getCurrentUserId = () => {
        try {
            const authUser = sessionStorage.getItem('authUser');
            if (authUser) {
                const user = JSON.parse(authUser);
                return user.user?.id || user.user?._id || user._id || user.id || null;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
        return null;
    };

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    if (!task) {
        return (
            <Card>
                <CardBody>
                    <p className="text-muted">No task data available</p>
                </CardBody>
            </Card>
        );
    }

    return (
        <React.Fragment>
            <Card>
                <CardHeader>
                    <div>
                        <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0" role="tablist">
                            <NavItem>
                                <NavLink
                                    href="#"
                                    className={classnames({ active: activeTab === '1' })}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleTab('1');
                                    }}
                                >
                                    Comments ({comments.length})
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    href="#"
                                    className={classnames({ active: activeTab === '2' })}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleTab('2');
                                    }}
                                >
                                    Attachments (0)
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </div>
                </CardHeader>
                <CardBody>
                    {activeTab === '1' && (
                        <>
                            <h5 className="card-title mb-4">Comments</h5>
                            <SimpleBar style={{ height: "400px" }} className="px-3 mx-n3 mb-2">
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <Spin size="large" />
                                    </div>
                                ) : comments.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={comments}
                                        renderItem={(comment) => {
                                            const currentUserId = getCurrentUserId();
                                            const canDelete = comment.ownerId === currentUserId;

                                            return (
                                                <List.Item
                                                    style={{
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid #f0f0f0',
                                                    }}
                                                    actions={canDelete ? [
                                                        <Popconfirm
                                                            key="delete"
                                                            title="Delete comment"
                                                            description="Are you sure you want to delete this comment?"
                                                            onConfirm={() => handleDeleteComment(comment.id)}
                                                            okText="Yes"
                                                            cancelText="No"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                type="text"
                                                                danger
                                                                size="small"
                                                                icon={<DeleteOutlined />}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </Popconfirm>
                                                    ] : []}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <Avatar
                                                                src={
                                                                    comment.owner?.avatar
                                                                        ? `${process.env.REACT_APP_API_URL || ''}/images/users/${comment.owner.avatar}`
                                                                        : undefined
                                                                }
                                                                icon={!comment.owner?.avatar ? <UserOutlined /> : undefined}
                                                                style={{ backgroundColor: '#1890ff' }}
                                                            >
                                                                {!comment.owner?.avatar && comment.ownerName ? comment.ownerName.charAt(0).toUpperCase() : null}
                                                            </Avatar>
                                                        }
                                                        title={
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <div>
                                                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{comment.ownerName}</span>
                                                                    {comment.ownerEmail && (
                                                                        <span style={{ fontSize: '12px', color: '#8c8c8c', marginLeft: 8 }}>
                                                                            {comment.ownerEmail}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                                    {dayjs(comment.commentedDate || comment.createdAt).format('MMM DD, YYYY HH:mm')}
                                                                </span>
                                                            </div>
                                                        }
                                                        description={
                                                            <div
                                                                dangerouslySetInnerHTML={{ __html: comment.comment }}
                                                                style={{
                                                                    marginTop: '8px',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1.6',
                                                                    color: '#595959'
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                ) : (
                                    <Empty
                                        description="No comments yet"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        style={{ margin: '40px 0' }}
                                    />
                                )}
                            </SimpleBar>

                            {/* Comment Editor */}
                            <div className="mt-4">
                                <h6 className="mb-2">Add Comment</h6>
                                <ReactQuill
                                    theme="snow"
                                    value={commentContent}
                                    onChange={setCommentContent}
                                    placeholder="Add a comment..."
                                    modules={{
                                        toolbar: [
                                            ['bold', 'italic', 'underline', 'strike'],
                                            ['blockquote', 'code-block'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            ['link'],
                                            ['clean']
                                        ],
                                    }}
                                    style={{ minHeight: '120px', marginBottom: '12px' }}
                                />
                                <Button
                                    type="primary"
                                    onClick={handlePostComment}
                                    loading={submitting}
                                >
                                    Post Comment
                                </Button>
                            </div>
                        </>
                    )}

                    {activeTab === '2' && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Empty
                                description="No attachments"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
        </React.Fragment>
    );
};

export default Comments;
