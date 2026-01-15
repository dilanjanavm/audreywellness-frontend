// src/Components/Common/modal/ImportCsvModal/SupplierImportCSV.js
import React, {useState, useEffect} from 'react';
import {
    Modal,
    Upload,
    Button,
    message,
    Progress,
    List,
    Tag,
    Alert,
    Space,
    Typography
} from 'antd';
import {
    InboxOutlined,
    UploadOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import * as supplierService from "../../../../service/supplierService";

const {Dragger} = Upload;
const {Text} = Typography;

const SupplierImportCSV = ({
    visible,
    onClose,
    onImportComplete
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (visible) {
            setUploading(false);
            setUploadProgress(0);
            setImportResult(null);
            setFileList([]);
        }
    }, [visible]);

    const handleClose = () => {
        setUploading(false);
        setUploadProgress(0);
        setImportResult(null);
        setFileList([]);
        onClose();
    };

    // Custom upload handler
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select a CSV file to upload');
            return;
        }

        const file = fileList[0];

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            message.error('Please upload only CSV files');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            message.error('File size must be less than 10MB');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Call the API
            const response = await supplierService.importSuppliersCSV(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Handle response structure: { total, successful, failed, errors } or { success, message, errors }
            if (response.data) {
                const result = response.data;
                
                // Check for suppliers-style response
                if (result.total !== undefined) {
                    setImportResult({
                        success: result.failed === 0,
                        total: result.total,
                        successful: result.successful,
                        failed: result.failed,
                        errors: result.errors || [],
                        message: `Import completed: ${result.successful} successful, ${result.failed} failed`
                    });
                    
                    if (result.failed === 0) {
                        message.success('CSV file imported successfully!');
                    } else {
                        message.warning(`Import completed with ${result.failed} errors`);
                    }
                } else if (result.success !== undefined) {
                    // Alternative response structure
                    setImportResult({
                        success: result.success,
                        message: result.message || (result.success ? 'Import successful' : 'Import failed'),
                        errors: result.errors || []
                    });
                    
                    if (result.success) {
                        message.success(result.message || 'CSV file imported successfully!');
                    } else {
                        message.error(result.message || 'Import failed');
                    }
                } else {
                    // Default success
                    setImportResult({
                        success: true,
                        message: 'Import completed successfully',
                        errors: []
                    });
                    message.success('CSV file imported successfully!');
                }

                // Notify parent component about import completion
                if (onImportComplete) {
                    onImportComplete(result);
                }
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Import error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Import failed due to server error';
            setImportResult({
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || []
            });
            message.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // Dragger props
    const draggerProps = {
        name: 'file',
        multiple: false,
        accept: '.csv',
        fileList: fileList,
        beforeUpload: (file) => {
            // Prevent auto upload
            setFileList([file]);
            return false;
        },
        onRemove: () => {
            setFileList([]);
            setImportResult(null);
        },
        onChange: (info) => {
            setFileList(info.fileList.slice(-1)); // Only keep the last file
            setImportResult(null);
        },
    };

    return (
        <Modal
            title={
                <Space>
                    <UploadOutlined />
                    <span>Import Suppliers from CSV</span>
                </Space>
            }
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button key="cancel" onClick={handleClose}>
                    Cancel
                </Button>,
                <Button
                    key="upload"
                    type="primary"
                    loading={uploading}
                    onClick={handleUpload}
                    disabled={fileList.length === 0}
                    icon={<UploadOutlined />}
                >
                    {uploading ? 'Importing...' : 'Import CSV'}
                </Button>
            ]}
            width={600}
            destroyOnClose
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Instructions */}
                <Alert
                    message="CSV Import Instructions"
                    description={
                        <div>
                            <Text>Please ensure your CSV file includes the following columns:</Text>
                            <List
                                size="small"
                                dataSource={[
                                    'Supplier Code',
                                    'Name',
                                    'Reference',
                                    'Address',
                                    'Contact Person',
                                    'Email',
                                    'Phone',
                                    'Phone 2 (optional)',
                                    'Fax (optional)',
                                    'NTN Number (optional)',
                                    'GST Number (optional)',
                                    'Payment Terms',
                                    'Tax Group',
                                    'Currency',
                                    'Is Active (true/false)'
                                ]}
                                renderItem={item => (
                                    <List.Item>
                                        <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        {item}
                                    </List.Item>
                                )}
                            />
                        </div>
                    }
                    type="info"
                    icon={<InfoCircleOutlined />}
                    showIcon
                />

                {/* File Upload Area */}
                <Dragger {...draggerProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for single CSV file upload. Maximum file size: 10MB
                    </p>
                </Dragger>

                {/* Upload Progress */}
                {uploading && (
                    <div>
                        <Text>Uploading and processing...</Text>
                        <Progress percent={uploadProgress} status="active" />
                    </div>
                )}

                {/* Import Result */}
                {importResult && (
                    <div>
                        {importResult.success ? (
                            <Alert
                                message="Import Successful"
                                description={
                                    <div>
                                        {importResult.total !== undefined ? (
                                            <div>
                                                <Text strong>Total: {importResult.total}</Text>
                                                <br />
                                                <Tag color="green">
                                                    <CheckCircleOutlined /> Successful: {importResult.successful}
                                                </Tag>
                                                {importResult.failed > 0 && (
                                                    <Tag color="red">
                                                        <CloseCircleOutlined /> Failed: {importResult.failed}
                                                    </Tag>
                                                )}
                                            </div>
                                        ) : (
                                            <Text>{importResult.message}</Text>
                                        )}
                                    </div>
                                }
                                type="success"
                                showIcon
                            />
                        ) : (
                            <Alert
                                message="Import Failed"
                                description={importResult.message}
                                type="error"
                                showIcon
                            />
                        )}

                        {/* Error Details */}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <Text strong>Errors:</Text>
                                <List
                                    size="small"
                                    bordered
                                    dataSource={importResult.errors}
                                    renderItem={(error, index) => (
                                        <List.Item>
                                            <Tag color="red">{index + 1}</Tag>
                                            {typeof error === 'string' ? error : JSON.stringify(error)}
                                        </List.Item>
                                    )}
                                    style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Space>
        </Modal>
    );
};

export default SupplierImportCSV;
