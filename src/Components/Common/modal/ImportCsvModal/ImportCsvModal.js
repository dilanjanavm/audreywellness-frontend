// src/Components/Common/modal/ImportCsvModal.js
import React, {useState} from 'react';
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
import * as customerService from "../../../../service/customerService";


const {Dragger} = Upload;
const {Text} = Typography;

const ImportCsvModal = ({
                            visible,
                            onClose,
                            onImportComplete
                        }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [importResult, setImportResult] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Reset state when modal opens
    const handleOpen = () => {
        setUploading(false);
        setUploadProgress(0);
        setImportResult(null);
        setFileList([]);
    };

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
            // Simulate progress (since we can't get actual upload progress with our current API setup)
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
            const response = await customerService.importCustomersFromCSV(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.success) {
                setImportResult(response.data);
                message.success('CSV file imported successfully!');

                // Notify parent component about successful import
                if (onImportComplete) {
                    onImportComplete(response.data);
                }
            } else {
                setImportResult(response.data || {
                    success: false,
                    message: response.message || 'Import failed',
                    errors: []
                });
                message.error(response.message || 'Import failed');
            }
        } catch (error) {
            console.error('Import error:', error);
            setImportResult({
                success: false,
                message: error.message || 'Import failed due to server error',
                errors: []
            });
            message.error(error.message || 'Import failed due to server error');
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
                    <UploadOutlined/>
                    Import Customers from CSV
                </Space>
            }
            open={visible}
            onCancel={handleClose}
            footer={
                !uploading && (
                    <Space>
                        <Button onClick={handleClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleUpload}
                            disabled={fileList.length === 0 || uploading}
                            loading={uploading}
                            icon={<UploadOutlined/>}
                        >
                            {uploading ? 'Importing...' : 'Start Import'}
                        </Button>
                    </Space>
                )
            }
            width={700}
            afterOpenChange={(open) => {
                if (open) handleOpen();
            }}
            destroyOnClose
        >
            {/* Instructions */}
            <Alert
                message="CSV Import Instructions"
                description={
                    <div>
                        <Text>Please ensure your CSV file contains the following columns:</Text>
                        <br/>
                        <Text strong>S.No, Name, Short Name, Branch Name, City/Area, Email, SMS Phone, Currency, Sales
                            Type, Payment Terms, DOB, Address, Status, Sales Group</Text>
                        <br/>
                        <Text type="secondary">First row should contain headers. Download our template for
                            reference.</Text>
                    </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined/>}
                className="mb-3"
            />

            {/* Upload Area */}
            <Dragger {...draggerProps} disabled={uploading}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined/>
                </p>
                <p className="ant-upload-text">
                    Click or drag CSV file to this area to upload
                </p>
                <p className="ant-upload-hint">
                    Support for a single CSV file upload. Maximum file size: 10MB
                </p>
            </Dragger>

            {/* Upload Progress */}
            {uploading && (
                <div className="mt-3">
                    <Text>Uploading and processing file...</Text>
                    <Progress
                        percent={uploadProgress}
                        status={uploadProgress === 100 ? 'success' : 'active'}
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                    />
                </div>
            )}

            {/* Import Results */}
            {importResult && (
                <div className="mt-4">
                    <Alert
                        message={importResult.success ? 'Import Successful' : 'Import Completed with Issues'}
                        description={importResult.message}
                        type={importResult.success ? 'success' : 'warning'}
                        showIcon
                        icon={importResult.success ? <CheckCircleOutlined/> : <CloseCircleOutlined/>}
                    />

                    {/* Import Statistics */}
                    {importResult.imported !== undefined && (
                        <div className="mt-3">
                            <Space size="large">
                                <Tag color="green">
                                    <CheckCircleOutlined/> Imported: {importResult.imported}
                                </Tag>
                                <Tag color="blue">
                                    <FileTextOutlined/> Updated: {importResult.updated}
                                </Tag>
                                <Tag color="orange">
                                    <InfoCircleOutlined/> Skipped: {importResult.skipped}
                                </Tag>
                                <Tag color="red">
                                    <CloseCircleOutlined/> Errors: {importResult.errors?.length || 0}
                                </Tag>
                            </Space>
                        </div>
                    )}

                    {/* Error Details */}
                    {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                            <Text strong>Error Details:</Text>
                            <List
                                size="small"
                                bordered
                                dataSource={importResult.errors}
                                renderItem={(error, index) => (
                                    <List.Item>
                                        <Text type="danger">{error}</Text>
                                    </List.Item>
                                )}
                                style={{maxHeight: '200px', overflowY: 'auto'}}
                                className="mt-2"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* File Info */}
            {fileList.length > 0 && !uploading && !importResult && (
                <div className="mt-3">
                    <Alert
                        message="File Ready for Import"
                        description={
                            <div>
                                <Text>Selected file: </Text>
                                <Text strong>{fileList[0].name}</Text>
                                <br/>
                                <Text type="secondary">
                                    Size: {(fileList[0].size / 1024).toFixed(2)} KB
                                </Text>
                            </div>
                        }
                        type="info"
                        showIcon
                    />
                </div>
            )}
        </Modal>
    );
};

export default ImportCsvModal;