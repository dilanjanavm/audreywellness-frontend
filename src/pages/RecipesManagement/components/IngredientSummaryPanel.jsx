import React from 'react';
import {
    Card,
    Table,
    Typography,
    Space,
    Tag,
    Checkbox,
} from 'antd';
import {
    CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const IngredientSummaryPanel = ({ ingredients, batchSize }) => {
    const allIngredientsPresent = ingredients.length > 0;

    const columns = [
        {
            title: 'Ingredient',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Quantity',
            key: 'quantity',
            render: (_, record) => (
                <Space>
                    <Text>{record.quantity}</Text>
                    <Text type="secondary">{record.unit}</Text>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Title level={5} style={{ margin: 0, color: '#111827' }}>
                        Ingredient Summary
                    </Title>
                    {batchSize && (
                        <Tag 
                            color="blue"
                            style={{
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500,
                            }}
                        >
                            {batchSize}
                        </Tag>
                    )}
                </div>
            }
            style={{ 
                height: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
            bodyStyle={{ padding: '20px' }}
        >
            {ingredients.length === 0 ? (
                <div 
                    className="text-center" 
                    style={{ 
                        padding: '40px 20px',
                        border: '2px dashed #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: '#f9fafb',
                    }}
                >
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        {batchSize 
                            ? 'No ingredients available for this batch size'
                            : 'Select a batch size to view ingredients'}
                    </Text>
                </div>
            ) : (
                <>
                    <Table
                        columns={columns}
                        dataSource={ingredients.map((ing, index) => ({
                            ...ing,
                            key: index,
                        }))}
                        pagination={false}
                        size="small"
                        style={{ marginBottom: '16px' }}
                        bordered={false}
                    />
                    <div style={{ 
                        padding: '12px 16px', 
                        backgroundColor: allIngredientsPresent ? '#f0fdf4' : '#fffbeb',
                        borderRadius: '8px',
                        border: `1px solid ${allIngredientsPresent ? '#86efac' : '#fde68a'}`,
                    }}>
                        <Space>
                            <CheckCircleOutlined 
                                style={{ 
                                    color: allIngredientsPresent ? '#16a34a' : '#f59e0b',
                                    fontSize: '16px',
                                }} 
                            />
                            <Text 
                                style={{ 
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: allIngredientsPresent ? '#16a34a' : '#f59e0b',
                                }}
                            >
                                {allIngredientsPresent 
                                    ? 'All ingredients ready' 
                                    : 'Waiting for ingredients'}
                            </Text>
                        </Space>
                    </div>
                </>
            )}
        </Card>
    );
};

export default IngredientSummaryPanel;

