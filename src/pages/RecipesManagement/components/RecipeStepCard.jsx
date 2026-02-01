import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Button,
    Input,
    InputNumber,
    Space,
    Typography,
    Row,
    Col,
    List,
} from 'antd';
import {
    DeleteOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    DragOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const RecipeStepCard = ({
    step,
    stepNumber,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
    ingredients = [],
}) => {
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);


    // Filter ingredients based on mention query
    const filteredIngredients = ingredients.filter(ing => 
        ing.name?.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    // Handle instruction change with mention detection
    const handleInstructionChange = (e) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        // Find '@' symbol before cursor
        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        // Check if '@' is found and there's no space between '@' and cursor
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            // Check if there's no space (meaning we're still in a mention)
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setMentionQuery(textAfterAt);
                setMentionStartIndex(lastAtIndex);
                setShowMentionDropdown(true);
                
                // Position dropdown near textarea
                if (textareaRef.current) {
                    const textarea = textareaRef.current.resizableTextArea?.textArea;
                    if (textarea) {
                        const rect = textarea.getBoundingClientRect();
                        setMentionPosition({
                            top: rect.bottom + 5,
                            left: rect.left,
                        });
                    }
                }
            } else {
                setShowMentionDropdown(false);
            }
        } else {
            setShowMentionDropdown(false);
        }
        
        onUpdate('instruction', value);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                textareaRef.current &&
                !textareaRef.current.resizableTextArea?.textArea?.contains(event.target)
            ) {
                setShowMentionDropdown(false);
            }
        };

        if (showMentionDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMentionDropdown]);

    // Handle ingredient selection from mention dropdown
    const handleIngredientSelect = (ingredientName) => {
        if (mentionStartIndex === -1) return;
        
        const currentInstruction = step.instruction || '';
        const textBeforeAt = currentInstruction.substring(0, mentionStartIndex);
        const textAfterAt = currentInstruction.substring(mentionStartIndex + 1); // +1 to skip '@'
        
        // Find where the mention query ends (space, newline, or end of string)
        const queryEndMatch = textAfterAt.match(/^[^\s\n]*/);
        const queryEndIndex = queryEndMatch ? queryEndMatch[0].length : 0;
        const textAfterQuery = textAfterAt.substring(queryEndIndex);
        
        // Build new instruction: text before @ + @ingredientName + space + text after query
        const newInstruction = textBeforeAt + '@' + ingredientName + ' ' + textAfterQuery;
        
        setShowMentionDropdown(false);
        setMentionQuery('');
        setMentionStartIndex(-1);
        
        onUpdate('instruction', newInstruction);
        
        // Set cursor position after inserted ingredient
        setTimeout(() => {
            if (textareaRef.current?.resizableTextArea?.textArea) {
                const newCursorPos = textBeforeAt.length + ingredientName.length + 2; // +2 for '@' and space
                textareaRef.current.resizableTextArea.textArea.setSelectionRange(newCursorPos, newCursorPos);
                textareaRef.current.resizableTextArea.textArea.focus();
            }
        }, 0);
    };

    // Handle keydown in textarea
    const handleKeyDown = (e) => {
        if (showMentionDropdown && filteredIngredients.length > 0) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                if (e.key === 'Enter' && filteredIngredients.length > 0) {
                    handleIngredientSelect(filteredIngredients[0].name);
                } else if (e.key === 'Escape') {
                    setShowMentionDropdown(false);
                }
            }
        }
    };

    return (
        <Card
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                marginBottom: '16px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
            }}
            bodyStyle={{ padding: '24px' }}
            hoverable
        >
            <Row gutter={[20, 20]}>
                {/* Step Header */}
                <Col xs={24}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                    }}>
                        <Space>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: '#f0f9ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #bae6fd',
                            }}>
                                <Text strong style={{ 
                                    fontSize: '14px', 
                                    color: '#0284c7',
                                }}>
                                    {stepNumber}
                                </Text>
                            </div>
                            <Text strong style={{ fontSize: '16px', color: '#111827' }}>
                                Step {stepNumber}
                            </Text>
                        </Space>
                        <Space size="small">
                            <Button
                                type="text"
                                icon={<DragOutlined />}
                                onClick={onMoveUp}
                                disabled={!canMoveUp}
                                size="small"
                                style={{ 
                                    color: '#6b7280',
                                    opacity: canMoveUp ? 1 : 0.3,
                                }}
                            />
                            <Button
                                type="text"
                                icon={<ArrowDownOutlined />}
                                onClick={onMoveDown}
                                disabled={!canMoveDown}
                                size="small"
                                style={{ 
                                    color: '#6b7280',
                                    opacity: canMoveDown ? 1 : 0.3,
                                }}
                            />
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={onDelete}
                                size="small"
                                style={{ color: '#ef4444' }}
                            />
                        </Space>
                    </div>
                </Col>

                {/* Instruction Input */}
                <Col xs={24}>
                    <div style={{ position: 'relative' }}>
                        <Text 
                            type="secondary" 
                            style={{ 
                                fontSize: '13px', 
                                fontWeight: 500,
                                marginBottom: '8px',
                                display: 'block',
                                color: '#6b7280',
                            }}
                        >
                            Instruction
                            <Text style={{ fontSize: '11px', marginLeft: '8px', fontWeight: 400 }}>
                                (Type '@' to mention ingredients)
                            </Text>
                        </Text>
                        <TextArea
                            ref={textareaRef}
                            placeholder="Enter step instruction (e.g., Add 50% @Water and heat to 100°C)"
                            value={step.instruction}
                            onChange={handleInstructionChange}
                            onKeyDown={handleKeyDown}
                            rows={3}
                            style={{ 
                                width: '100%',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px',
                            }}
                        />
                        {showMentionDropdown && filteredIngredients.length > 0 && (
                            <div
                                ref={dropdownRef}
                                style={{
                                    position: 'fixed',
                                    top: mentionPosition.top,
                                    left: mentionPosition.left,
                                    zIndex: 1050,
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    maxHeight: '240px',
                                    overflowY: 'auto',
                                    minWidth: '240px',
                                    marginTop: '4px',
                                }}
                            >
                                <div style={{ 
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #f3f4f6',
                                    backgroundColor: '#f9fafb',
                                }}>
                                    <Text strong style={{ fontSize: '12px', color: '#6b7280' }}>
                                        Select Ingredient
                                    </Text>
                                </div>
                                <List
                                    size="small"
                                    dataSource={filteredIngredients}
                                    renderItem={(ingredient) => (
                                        <List.Item
                                            style={{
                                                cursor: 'pointer',
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f3f4f6',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#fff';
                                            }}
                                            onClick={() => handleIngredientSelect(ingredient.name)}
                                        >
                                            <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                                <Text strong style={{ fontSize: '14px', color: '#111827' }}>
                                                    {ingredient.name}
                                                </Text>
                                                {ingredient.quantity && (
                                                    <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        {ingredient.quantity} {ingredient.unit}
                                                    </Text>
                                                )}
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </Col>

                {/* Condition Inputs */}
                <Col xs={24} sm={12}>
                    <div>
                        <Text 
                            type="secondary" 
                            style={{ 
                                fontSize: '13px', 
                                fontWeight: 500,
                                marginBottom: '8px',
                                display: 'block',
                                color: '#6b7280',
                            }}
                        >
                            Temperature
                        </Text>
                        <InputNumber
                            style={{ 
                                width: '100%',
                                borderRadius: '8px',
                            }}
                            placeholder="Enter temperature"
                            value={step.temperature}
                            onChange={(value) => onUpdate('temperature', value)}
                            min={0}
                            max={500}
                            addonAfter={<span style={{ color: '#6b7280' }}>°C</span>}
                            size="large"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12}>
                    <div>
                        <Text 
                            type="secondary" 
                            style={{ 
                                fontSize: '13px', 
                                fontWeight: 500,
                                marginBottom: '8px',
                                display: 'block',
                                color: '#6b7280',
                            }}
                        >
                            Time Duration
                        </Text>
                        <InputNumber
                            style={{ 
                                width: '100%',
                                borderRadius: '8px',
                            }}
                            placeholder="Enter duration"
                            value={step.duration}
                            onChange={(value) => onUpdate('duration', value)}
                            min={0}
                            max={999}
                            addonAfter={<span style={{ color: '#6b7280' }}>min</span>}
                            size="large"
                        />
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default RecipeStepCard;

