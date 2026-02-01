import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Select,
    Button,
    Descriptions,
    Table,
    Tag,
    Typography,
    Divider,
    Space,
    message,
    Spin,
} from 'antd';
import {
    SwapOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    MinusOutlined,
} from '@ant-design/icons';
import * as costingService from '../../service/costingService';

const { Title, Text } = Typography;
const { Option } = Select;

const CostingComparison = ({ visible, onCancel, costing1, costing2, onSelectCosting2, availableCostings }) => {
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [selectedCosting2Id, setSelectedCosting2Id] = useState(null);

    const loadComparison = useCallback(async () => {
        if (!costing1 || !costing2) return;
        setLoading(true);
        try {
            const response = await costingService.compareCostings(costing1.id, costing2.id);
            if (response.success && response.data) {
                setComparisonData(response.data);
            } else if (response.data) {
                setComparisonData(response.data);
            } else {
                message.error('Failed to load comparison data');
            }
        } catch (error) {
            message.error('Failed to load comparison');
        } finally {
            setLoading(false);
        }
    }, [costing1, costing2]);

    useEffect(() => {
        if (visible && costing1 && costing2) {
            loadComparison();
        } else {
            setComparisonData(null);
        }
    }, [visible, costing1, costing2, loadComparison]);

    const handleCompare = () => {
        if (!selectedCosting2Id) {
            message.warning('Please select a costing to compare');
            return;
        }
        const selectedCosting = availableCostings.find(c => c.id === selectedCosting2Id);
        if (selectedCosting && onSelectCosting2) {
            onSelectCosting2(selectedCosting);
        }
    };

    const renderDifference = (value1, value2) => {
        if (value1 === undefined || value2 === undefined) return '-';
        const diff = value2 - value1;
        const percentChange = value1 !== 0 ? ((diff / value1) * 100).toFixed(2) : 0;
        
        if (diff > 0) {
            return (
                <Space>
                    <Text type="danger">
                        <ArrowUpOutlined /> +${Math.abs(diff).toFixed(2)} (+{percentChange}%)
                    </Text>
                </Space>
            );
        } else if (diff < 0) {
            return (
                <Space>
                    <Text type="success">
                        <ArrowDownOutlined /> -${Math.abs(diff).toFixed(2)} ({percentChange}%)
                    </Text>
                </Space>
            );
        } else {
            return (
                <Space>
                    <Text type="secondary">
                        <MinusOutlined /> No change
                    </Text>
                </Space>
            );
        }
    };

    const batchSizeColumns = [
        {
            title: 'Batch Size',
            dataIndex: 'batchSize',
            key: 'batchSize',
            width: 150,
        },
        {
            title: 'Version 1 Cost',
            dataIndex: 'cost1',
            key: 'cost1',
            width: 150,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
        },
        {
            title: 'Version 2 Cost',
            dataIndex: 'cost2',
            key: 'cost2',
            width: 150,
            render: (cost) => cost ? `$${parseFloat(cost).toFixed(2)}` : '-',
        },
        {
            title: 'Difference',
            key: 'difference',
            width: 200,
            render: (_, record) => renderDifference(record.cost1, record.cost2),
        },
    ];

    return (
        <Modal
            title={
                <Space>
                    <SwapOutlined />
                    <span>Compare Costing Versions</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>,
            ]}
            width={1000}
        >
            {!costing2 && (
                <div style={{ marginBottom: 20 }}>
                    <Text strong>Select a costing to compare with Version {costing1?.version}:</Text>
                    <Space style={{ width: '100%', marginTop: 10 }} direction="vertical">
                        <Select
                            placeholder="Select costing version"
                            style={{ width: '100%' }}
                            value={selectedCosting2Id}
                            onChange={setSelectedCosting2Id}
                        >
                            {availableCostings && availableCostings.length > 0 ? (
                                availableCostings.map((costing) => (
                                    <Option key={costing.id} value={costing.id}>
                                        Version {costing.version} - {costing.isActive ? 'Active' : 'Inactive'}
                                    </Option>
                                ))
                            ) : (
                                <Option disabled>No costings available</Option>
                            )}
                        </Select>
                        <Button type="primary" onClick={handleCompare} disabled={!selectedCosting2Id}>
                            Compare
                        </Button>
                    </Space>
                </div>
            )}

            {costing1 && costing2 && (
                <Spin spinning={loading}>
                    <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
                        <Descriptions.Item label="Version 1">
                            <Tag color="blue">v{costing1.version}</Tag> - {costing1.itemCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Version 2">
                            <Tag color="green">v{costing2.version}</Tag> - {costing2.itemCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Version 1 Status">
                            <Tag color={costing1.isActive ? 'success' : 'default'}>
                                {costing1.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Version 2 Status">
                            <Tag color={costing2.isActive ? 'success' : 'default'}>
                                {costing2.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    {comparisonData?.differences && (
                        <>
                            <Title level={5}>Total Costs Comparison</Title>
                            {comparisonData.differences.totalCosts && (
                                <Table
                                    columns={batchSizeColumns}
                                    dataSource={Object.keys(comparisonData.differences.totalCosts).map((batchSize) => {
                                        const diff = comparisonData.differences.totalCosts[batchSize];
                                        return {
                                            key: batchSize,
                                            batchSize: batchSize.replace('BATCH_', '').replace('_', ' '),
                                            cost1: diff.cost1 || diff.previousCost,
                                            cost2: diff.cost2 || diff.currentCost,
                                        };
                                    })}
                                    pagination={false}
                                    size="small"
                                />
                            )}

                            {comparisonData.differences.rawMaterials && comparisonData.differences.rawMaterials.length > 0 && (
                                <>
                                    <Divider />
                                    <Title level={5}>Raw Materials Comparison</Title>
                                    <Table
                                        columns={[
                                            { title: 'Material', dataIndex: 'rawMaterialName', key: 'rawMaterialName' },
                                            { title: 'V1 Percentage', dataIndex: 'percentage1', key: 'percentage1', render: (val) => val ? `${val}%` : '-' },
                                            { title: 'V2 Percentage', dataIndex: 'percentage2', key: 'percentage2', render: (val) => val ? `${val}%` : '-' },
                                            { title: 'V1 Unit Price', dataIndex: 'unitPrice1', key: 'unitPrice1', render: (val) => val ? `$${val.toFixed(2)}` : '-' },
                                            { title: 'V2 Unit Price', dataIndex: 'unitPrice2', key: 'unitPrice2', render: (val) => val ? `$${val.toFixed(2)}` : '-' },
                                            { title: 'V1 Total Cost', dataIndex: 'totalCost1', key: 'totalCost1', render: (val) => val ? `$${val.toFixed(2)}` : '-' },
                                            { title: 'V2 Total Cost', dataIndex: 'totalCost2', key: 'totalCost2', render: (val) => val ? `$${val.toFixed(2)}` : '-' },
                                        ]}
                                        dataSource={comparisonData.differences.rawMaterials.map((rm, idx) => ({
                                            key: idx,
                                            ...rm,
                                        }))}
                                        pagination={false}
                                        size="small"
                                    />
                                </>
                            )}
                        </>
                    )}
                </Spin>
            )}
        </Modal>
    );
};

export default CostingComparison;

