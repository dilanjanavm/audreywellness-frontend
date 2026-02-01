// src/Components/Common/modal/Items/ImportCsvModal.js
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
    InfoCircleOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import * as itemService from "../../../../service/itemService";

const {Dragger} = Upload;
const {Text} = Typography;

const ItemImportCSV = ({
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

    // Handle CSV template download
    const handleDownloadTemplate = async () => {
        try {
            const response = await itemService.downloadCsvTemplate();

            // Create blob and download
            const blob = new Blob([response.data], {type: 'text/csv'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'item_import_template.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success('Template downloaded successfully');
        } catch (error) {
            console.error('Error downloading template:', error);
            message.error('Failed to download template');
        }
    };

    // Custom upload handler
    const handleUpload = async () => {
        if (fileList.length === 0) {
            message.warning('Please select a CSV file to upload');
            return;
        }
        console.log(fileList)
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
            const res = await itemService.importItemsFromCSVFile(file);
            const response = res.data
            clearInterval(progressInterval);
            setUploadProgress(100);
            console.log(response)
            if (response.success) {

                setImportResult(response.data || {
                    success: response.status,
                    message: response.message || 'Import failed',
                    errors: response.errors,
                    totalImported: response.totalImported,
                    totalProcessed: response.totalProcessed,
                });
                message.success('CSV file imported successfully!');

                // Notify parent component about successful import
                if (onImportComplete) {
                    onImportComplete(response.data);
                }
            } else {
                setImportResult( {
                    success: response.status,
                    data: response.data,
                    message: response.message || 'Import failed',
                    errors: response.errors,
                    totalImported: response.totalImported,
                    totalProcessed: response.totalProcessed,
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
    console.log('importResult', importResult)
    return (
        <Modal
            title={
                <Space>
                    <UploadOutlined/>
                    Import Items from CSV
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
                        <Text strong>item_code, stock_id, description, category, units, price, alt_price,
                            currency</Text>
                        <br/>
                        <Text type="secondary">
                            Required fields: item_code, description, category, units
                            <br/>
                            Optional fields: stock_id, price, alt_price, currency
                            <br/>
                            Units: pcs, Kg, ltr, boxes, Nos
                        </Text>
                        <br/>
                        <Button
                            type="link"
                            icon={<DownloadOutlined/>}
                            onClick={handleDownloadTemplate}
                            className="p-0"
                        >
                            Download CSV Template
                        </Button>
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
                    {/* Main Alert */}
                    <Alert
                        message={importResult.success ? 'Import Successful' : 'Import Completed with Issues'}
                        description={
                            <div>
                                <div>Processed {importResult.totalProcessed || 0} records</div>
                                {importResult.message && (
                                    <div className="mt-1">{importResult.message}</div>
                                )}
                            </div>
                        }
                        type={importResult.success ? 'success' : 'warning'}
                        showIcon
                        icon={importResult.success ? <CheckCircleOutlined/> : <CloseCircleOutlined/>}
                    />

                    {/* Import Statistics */}
                    <div className="mt-3">
                        <Space size="large" wrap>
                            <Tag color="blue">
                                <FileTextOutlined/> Total Processed: {importResult.totalProcessed || 0}
                            </Tag>
                            <Tag color="green">
                                <CheckCircleOutlined/> Successfully Imported: {importResult.totalImported || 0}
                            </Tag>
                            {importResult.errors && importResult.errors.length > 0 && (
                                <Tag color="red">
                                    <CloseCircleOutlined/> Errors: {importResult.errors.length}
                                </Tag>
                            )}
                            {importResult.totalProcessed && importResult.totalImported && (
                                <Tag color="orange">
                                    <InfoCircleOutlined/> Failed: {importResult.totalProcessed - importResult.totalImported}
                                </Tag>
                            )}
                        </Space>
                    </div>

                    {/* Error Details */}
                    {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                            <Text strong>Error Details ({importResult.errors.length} errors):</Text>
                            <List
                                size="small"
                                bordered
                                dataSource={importResult.errors}
                                renderItem={(error, index) => (
                                    <List.Item>
                                        <Space direction="vertical" size={0} style={{width: '100%'}}>
                                            <Text type="danger" style={{fontSize: '12px'}}>
                                                {error}
                                            </Text>
                                        </Space>
                                    </List.Item>
                                )}
                                style={{
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    marginTop: '8px'
                                }}
                                className="error-list"
                            />
                        </div>
                    )}

                    {/* Successfully Imported Items Preview */}
                    {importResult.data && importResult.data.length > 0 && (
                        <div className="mt-3">
                            <Text strong>Successfully Imported Items ({importResult.data.length} items):</Text>
                            <List
                                size="small"
                                bordered
                                dataSource={importResult.data.slice(0, 5)} // Show first 5 items as preview
                                renderItem={(item, index) => (
                                    <List.Item>
                                        <Space direction="vertical" size={0} style={{width: '100%'}}>
                                            <Space>
                                                <Text strong style={{fontSize: '12px'}}>{item.itemCode}</Text>
                                                <Text style={{fontSize: '12px'}}>-</Text>
                                                <Text style={{fontSize: '12px'}}>{item.description}</Text>
                                            </Space>
                                            <Space size="small">
                                                <Tag color="blue" size="small">{item.category}</Tag>
                                                <Tag color="default" size="small">{item.units}</Tag>
                                                {item.price > 0 && (
                                                    <Tag color="green" size="small">LKR {item.price}</Tag>
                                                )}
                                            </Space>
                                        </Space>
                                    </List.Item>
                                )}
                                style={{
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    marginTop: '8px'
                                }}
                            />
                            {importResult.data.length > 5 && (
                                <Text type="secondary" style={{fontSize: '12px'}} className="mt-1">
                                    ... and {importResult.data.length - 5} more items
                                </Text>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default ItemImportCSV;