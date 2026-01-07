import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
    Card,
    Row,
    Col,
    Typography,
    Space,
    Tag,
    Button,
    Empty,
    Progress,
    message,
    Spin,
} from 'antd';
import {
    ClockCircleOutlined,
    FireOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ShoppingOutlined,
    CloseCircleOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import * as taskService from '../../../service/taskService';

const { Title, Text } = Typography;

const StartRecipe = ({ task, recipe, costedProduct, recipeExecution: initialRecipeExecution, onComplete, onError }) => {
    const [recipeExecution, setRecipeExecution] = useState(initialRecipeExecution);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [localElapsedTime, setLocalElapsedTime] = useState({}); // For real-time display
    const [progressUpdateInterval, setProgressUpdateInterval] = useState(null);

    // Initialize state from recipeExecution on mount or when it changes
    useEffect(() => {
        if (recipeExecution) {
            initializeStateFromExecution(recipeExecution);
        } else {
            // No execution yet - initialize empty state
            resetState();
        }
    }, [recipeExecution?.id]); // Only reinitialize if execution ID changes

    // Initialize state from backend execution data
    const initializeStateFromExecution = useCallback((execution) => {
        if (!execution || !execution.stepExecutions) return;

        // Calculate elapsed time for current step from startedAt
        const elapsedForSteps = {};
        execution.stepExecutions.forEach((stepExec) => {
            if (stepExec.startedAt && stepExec.status === 'in_progress') {
                const started = dayjs(stepExec.startedAt);
                const now = dayjs();
                const elapsedSeconds = now.diff(started, 'second');
                elapsedForSteps[stepExec.stepOrder - 1] = elapsedSeconds;
            } else if (stepExec.completedAt && stepExec.startedAt) {
                const started = dayjs(stepExec.startedAt);
                const completed = dayjs(stepExec.completedAt);
                const elapsedSeconds = completed.diff(started, 'second');
                elapsedForSteps[stepExec.stepOrder - 1] = elapsedSeconds;
            }
        });

        setLocalElapsedTime(elapsedForSteps);

        // Start timer if execution is in_progress
        if (execution.status === 'in_progress' && execution.currentStep) {
            const stepIndex = execution.currentStep.stepOrder - 1;
            
            // Clear existing interval using functional update
            setProgressUpdateInterval((prevInterval) => {
                if (prevInterval) {
                    clearInterval(prevInterval);
                }

                const interval = setInterval(() => {
                    setLocalElapsedTime((prev) => ({
                        ...prev,
                        [stepIndex]: (prev[stepIndex] || 0) + 1,
                    }));
                }, 1000);

                return interval;
            });
        } else {
            setProgressUpdateInterval((prevInterval) => {
                if (prevInterval) {
                    clearInterval(prevInterval);
                }
                return null;
            });
        }
    }, []);

    const resetState = () => {
        setLocalElapsedTime({});
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
            setProgressUpdateInterval(null);
        }
    };

    // Stop local timer
    const stopLocalTimer = useCallback(() => {
        setProgressUpdateInterval((prevInterval) => {
            if (prevInterval) {
                clearInterval(prevInterval);
            }
            return null;
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (progressUpdateInterval) {
                clearInterval(progressUpdateInterval);
            }
        };
    }, [progressUpdateInterval]);

    // Debounced progress update function (per guide recommendations)
    const debouncedUpdateProgress = useMemo(() => {
        return debounce(async (taskId, stepOrder, progressValue) => {
            try {
                await taskService.updateStepProgress(taskId, stepOrder, {
                    progress: Math.round(progressValue),
                });
            } catch (error) {
                console.error('Error updating progress:', error);
                // Silently fail - progress updates are non-critical
            }
        }, 5000); // 5 second debounce as per guide
    }, []);

    // Periodic progress update (every 30 seconds when execution is in progress)
    useEffect(() => {
        if (recipeExecution?.status === 'in_progress' && recipeExecution?.currentStep && task?.taskId) {
            const updateProgress = async () => {
                try {
                    const currentStep = recipeExecution.currentStep;
                    const stepOrder = currentStep.stepOrder;
                    
                    // Calculate progress from elapsed time
                    // Use recipe from execution if available (per backend alignment doc)
                    const activeRecipeForProgress = recipeExecution?.recipe || recipe;
                    const sortedStepsLocal = [...(activeRecipeForProgress?.steps || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
                    const stepExec = recipeExecution.stepExecutions?.find(se => se.stepOrder === stepOrder);
                    const step = sortedStepsLocal.find(s => s.order === stepOrder);
                    
                    if (step && stepExec?.startedAt) {
                        const started = dayjs(stepExec.startedAt);
                        const now = dayjs();
                        const elapsedSeconds = now.diff(started, 'second');
                        const durationSeconds = (step.duration || 0) * 60;
                        const progress = durationSeconds > 0 ? Math.min((elapsedSeconds / durationSeconds) * 100, 100) : 0;

                        // Use debounced update
                        debouncedUpdateProgress(task.taskId, stepOrder, progress);
                    }
                } catch (error) {
                    console.error('Error calculating progress:', error);
                }
            };

            // Update immediately (first time)
            updateProgress();

            // Then update every 30 seconds
            const interval = setInterval(updateProgress, 30000);
            return () => {
                clearInterval(interval);
                debouncedUpdateProgress.cancel(); // Cancel any pending debounced calls
            };
        }
    }, [recipeExecution?.status, recipeExecution?.currentStep?.stepOrder, recipeExecution?.stepExecutions, task?.taskId, recipe?.steps, debouncedUpdateProgress]);

    // Refresh execution status
    const refreshExecutionStatus = useCallback(async () => {
        if (!task?.id) return;

        try {
            setLoading(true);
            const response = await taskService.getRecipeExecutionStatus(task.taskId);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);
            }
        } catch (error) {
            console.error('Error refreshing execution status:', error);
            // If execution doesn't exist, that's okay (not started yet)
            if (error.response?.status !== 404) {
                message.error('Failed to refresh execution status');
            }
        } finally {
            setLoading(false);
        }
    }, [task?.id, initializeStateFromExecution]);

    // Start recipe execution
    const handleStartRecipe = async () => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            // Backend will auto-find recipe if not provided (per alignment doc)
            const recipeIdToUse = recipeExecution?.recipe?.id || recipe?.id;
            console.log(task);
            
            const response = await taskService.startRecipeExecution(task.taskId, recipeIdToUse || null);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);
                message.success('Recipe execution started. First step is now active.');
            }
        } catch (error) {
            console.error('Error starting recipe execution:', error);
            const errorMsg = error.response?.data?.message || 'Failed to start recipe execution';
            message.error(errorMsg);
            // Call onError callback if provided (per guide recommendations)
            if (onError) {
                onError(error, 'start');
            }
        } finally {
            setActionLoading(false);
        }
    };

    // Pause recipe execution
    const handlePauseRecipe = async () => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            stopLocalTimer();
            const response = await taskService.pauseRecipeExecution(task.taskId);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                message.success('Recipe execution paused');
            }
        } catch (error) {
            console.error('Error pausing recipe execution:', error);
            const errorMsg = error.response?.data?.message || 'Failed to pause recipe execution';
            message.error(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    // Resume recipe execution
    const handleResumeRecipe = async () => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            const response = await taskService.resumeRecipeExecution(task.taskId);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);
                message.success('Recipe execution resumed');
            }
        } catch (error) {
            console.error('Error resuming recipe execution:', error);
            const errorMsg = error.response?.data?.message || 'Failed to resume recipe execution';
            message.error(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    // Complete a step
    const handleCompleteStep = async (stepOrder) => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            stopLocalTimer();

            // Get current step execution to calculate actual duration
            const currentStepExec = recipeExecution?.stepExecutions?.find(
                (se) => se.stepOrder === stepOrder
            );
            let actualDuration = null;
            if (currentStepExec?.startedAt) {
                const started = dayjs(currentStepExec.startedAt);
                const now = dayjs();
                actualDuration = now.diff(started, 'minute', true); // In minutes with decimals
            }

            const completionData = {};
            if (actualDuration !== null) {
                completionData.actualDuration = Math.round(actualDuration * 10) / 10; // Round to 1 decimal
            }

            const response = await taskService.completeStep(task.taskId, stepOrder, completionData);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);
                
                // Check if execution is completed
                if (executionData.status === 'completed') {
                    message.success('All steps completed successfully!');
                    // Call onComplete callback if provided (per guide recommendations)
                    if (onComplete) {
                        onComplete(executionData);
                    }
                } else {
                    message.success(`Step ${stepOrder} completed. Next step started automatically.`);
                }
                
                // Refresh status after a short delay to ensure backend state is synced
                setTimeout(() => {
                    refreshExecutionStatus();
                }, 1000);
            }
        } catch (error) {
            console.error('Error completing step:', error);
            const errorMsg = error.response?.data?.message || 'Failed to complete step';
            message.error(errorMsg);
            // Call onError callback if provided (per guide recommendations)
            if (onError) {
                onError(error, 'complete');
            }
        } finally {
            setActionLoading(false);
        }
    };

    // Cancel recipe execution
    const handleCancelRecipe = async () => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            stopLocalTimer();
            const response = await taskService.cancelRecipeExecution(task.taskId);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                resetState();
                message.info('Recipe execution cancelled');
            }
        } catch (error) {
            console.error('Error cancelling recipe execution:', error);
            const errorMsg = error.response?.data?.message || 'Failed to cancel recipe execution';
            message.error(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    // Format helper functions (simple pure functions, no memoization needed)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatBatchSize = (batchSize) => {
        if (!batchSize) return '';
        return batchSize.replace('batch', '').replace(/([A-Z])/g, ' $1').replace('_', '.').trim();
    };

    // Prefer recipe from execution, fallback to prop (per backend alignment doc)
    // Memoize activeRecipe for performance (per guide recommendations)
    const activeRecipe = useMemo(() => {
        return recipeExecution?.recipe || recipe;
    }, [recipeExecution?.recipe, recipe]);
    
    // Memoize sorted steps for performance (per guide recommendations)
    const sortedSteps = useMemo(() => {
        return activeRecipe?.steps
            ? [...activeRecipe.steps].sort((a, b) => (a.order || 0) - (b.order || 0))
            : [];
    }, [activeRecipe?.steps]);

    const totalTime = useMemo(() => {
        return activeRecipe?.totalTime || sortedSteps.reduce((sum, step) => sum + (step.duration || 0), 0);
    }, [activeRecipe?.totalTime, sortedSteps]);

    if (!activeRecipe) {
        return (
            <Empty
                description="No recipe available for this task"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    // Get execution status and data
    const executionStatus = recipeExecution?.status || 'not_started';
    const currentStep = recipeExecution?.currentStep || null;
    const stepExecutions = recipeExecution?.stepExecutions || [];
    const completedSteps = stepExecutions.filter((se) => se.status === 'completed').length;
    // Use overallProgress from backend (already calculated)
    const overallProgress = recipeExecution?.overallProgress || 0;
    // Use elapsedTime from backend (in minutes, accumulated across pauses)
    const elapsedTime = recipeExecution?.elapsedTime || 0;

    // Helper functions to get step execution data
    const getStepExecution = (stepOrder) => {
        return stepExecutions.find((se) => se.stepOrder === stepOrder);
    };

    const getStepStatus = (stepOrder) => {
        const stepExec = getStepExecution(stepOrder);
        return stepExec?.status || 'pending';
    };

    const isStepCompleted = (stepOrder) => {
        return getStepStatus(stepOrder) === 'completed';
    };

    const isCurrentStep = (stepOrder) => {
        return currentStep?.stepOrder === stepOrder;
    };

    const canStartStep = (stepOrder) => {
        // Can start if:
        // 1. Execution is not_started and it's the first step
        // 2. Execution is in_progress and all previous steps are completed
        // 3. No current step is active (unless this is the current step)

        if (executionStatus === 'completed' || executionStatus === 'cancelled') {
            return false;
        }

        if (executionStatus === 'not_started') {
            return stepOrder === 1; // Can only start first step
        }

        if (executionStatus === 'paused') {
            // Can only resume current step when paused
            return isCurrentStep(stepOrder);
        }

        if (executionStatus === 'in_progress') {
            // Check if previous steps are completed
            for (let i = 1; i < stepOrder; i++) {
                if (!isStepCompleted(i)) {
                    return false;
                }
            }
            // Can start if no current step or this is the current step
            return !currentStep || isCurrentStep(stepOrder);
        }

        return false;
    };

    // Calculate step progress and remaining time (per backend alignment doc)
    const getStepProgressData = (stepOrder) => {
        const stepExec = getStepExecution(stepOrder);
        // Use recipe.steps[stepOrder - 1] for duration (per backend alignment doc - stepOrder is 1-based)
        const step = sortedSteps.find((s) => s.order === stepOrder);

        if (!step) return { progress: 0, remaining: 0, elapsed: 0 };

        // Use currentStep.progress if available (per backend alignment doc)
        let progress = 0;
        if (isCurrentStep(stepOrder) && currentStep?.progress !== undefined) {
            progress = currentStep.progress;
        } else if (stepExec?.progress !== undefined) {
            progress = stepExec.progress;
        } else {
            // Calculate from elapsed time if progress not provided
            let elapsed = 0;
            if (stepExec?.startedAt) {
                if (stepExec.status === 'in_progress') {
                    // Use local elapsed time for real-time display
                    elapsed = localElapsedTime[stepOrder - 1] || 0;
                    if (!elapsed && stepExec.startedAt) {
                        // Calculate from startedAt if local time not available
                        const started = dayjs(stepExec.startedAt);
                        const now = dayjs();
                        elapsed = now.diff(started, 'second');
                    }
                } else if (stepExec.completedAt && stepExec.startedAt) {
                    const started = dayjs(stepExec.startedAt);
                    const completed = dayjs(stepExec.completedAt);
                    elapsed = completed.diff(started, 'second');
                }
            }
            const durationSeconds = (step.duration || 0) * 60;
            progress = durationSeconds > 0 ? Math.min((elapsed / durationSeconds) * 100, 100) : 0;
        }

        // Calculate elapsed time for current step (per backend alignment doc)
        let elapsed = 0;
        if (stepExec?.startedAt) {
            if (stepExec.status === 'in_progress') {
                // Use local elapsed time for real-time display
                elapsed = localElapsedTime[stepOrder - 1] || 0;
                if (!elapsed) {
                    // Calculate from currentStep.startedAt (per backend alignment doc)
                    const started = dayjs(stepExec.startedAt);
                    const now = dayjs();
                    elapsed = now.diff(started, 'second');
                }
            } else if (stepExec.completedAt && stepExec.startedAt) {
                const started = dayjs(stepExec.startedAt);
                const completed = dayjs(stepExec.completedAt);
                elapsed = completed.diff(started, 'second');
            }
        }

        const durationSeconds = (step.duration || 0) * 60;
        const remaining = Math.max(0, durationSeconds - elapsed);

        return { progress, remaining, elapsed };
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Execution Status Banner */}
            {executionStatus !== 'not_started' && (
                <Card
                    style={{
                        marginBottom: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        background:
                            executionStatus === 'completed'
                                ? '#f6ffed'
                                : executionStatus === 'paused'
                                ? '#fff7e6'
                                : '#e6f7ff',
                    }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <Row gutter={[16, 8]} align="middle">
                        <Col flex="auto">
                            <Space>
                                <Text strong style={{ fontSize: '14px' }}>
                                    Execution Status:
                                </Text>
                                <Tag
                                    color={
                                        executionStatus === 'completed'
                                            ? 'green'
                                            : executionStatus === 'in_progress'
                                            ? 'blue'
                                            : executionStatus === 'paused'
                                            ? 'orange'
                                            : 'default'
                                    }
                                    style={{ fontSize: '13px', padding: '4px 12px' }}
                                >
                                    {executionStatus?.toUpperCase().replace('_', ' ')}
                                </Tag>
                                {currentStep && (
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        Current Step: {currentStep.stepOrder} / {sortedSteps.length}
                                    </Text>
                                )}
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                {executionStatus === 'in_progress' && (
                                    <Button
                                        icon={<PauseCircleOutlined />}
                                        onClick={handlePauseRecipe}
                                        loading={actionLoading}
                                    >
                                        Pause Execution
                                    </Button>
                                )}
                                {executionStatus === 'paused' && (
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        onClick={handleResumeRecipe}
                                        loading={actionLoading}
                                    >
                                        Resume Execution
                                    </Button>
                                )}
                                {(executionStatus === 'in_progress' || executionStatus === 'paused') && (
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={handleCancelRecipe}
                                        loading={actionLoading}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={refreshExecutionStatus}
                                    loading={loading}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* Compact Header */}
            <Card
                style={{
                    marginBottom: '20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #458533 0%, #5ea548 100%)',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(69, 133, 51, 0.12)',
                }}
                bodyStyle={{ padding: '20px 24px' }}
            >
                <Row gutter={[16, 12]} align="middle">
                    <Col flex="auto">
                        <Space direction="vertical" size={8}>
                            <Title
                                level={4}
                                style={{
                                    color: '#ffffff',
                                    margin: 0,
                                    fontSize: '20px',
                                    fontWeight: 600,
                                }}
                            >
                                {activeRecipe.name || costedProduct?.itemName || 'Recipe'}
                            </Title>
                            <Space size={8} wrap>
                                <Tag
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.25)',
                                        color: '#ffffff',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '6px',
                                        padding: '2px 10px',
                                        margin: 0,
                                        fontSize: '12px',
                                    }}
                                >
                                    v{activeRecipe.version}
                                </Tag>
                                {activeRecipe.isActiveVersion && (
                                    <Tag
                                        icon={<CheckCircleOutlined />}
                                        style={{
                                            background: 'rgba(82, 196, 26, 0.25)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(82, 196, 26, 0.4)',
                                            borderRadius: '6px',
                                            padding: '2px 10px',
                                            margin: 0,
                                            fontSize: '12px',
                                        }}
                                    >
                                        Active
                                    </Tag>
                                )}
                                {activeRecipe.batchSize && (
                                    <Tag
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: '6px',
                                            padding: '2px 10px',
                                            margin: 0,
                                            fontSize: '12px',
                                        }}
                                    >
                                        {formatBatchSize(activeRecipe.batchSize)}
                                    </Tag>
                                )}
                                {costedProduct?.itemCode && (
                                    <Tag
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.25)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.3)',
                                            borderRadius: '6px',
                                            padding: '2px 10px',
                                            margin: 0,
                                            fontSize: '12px',
                                        }}
                                    >
                                        #{costedProduct.itemCode}
                                    </Tag>
                                )}
                            </Space>
                        </Space>
                    </Col>
                    <Col flex="none">
                        <div style={{ textAlign: 'right' }}>
                            <Text
                                style={{
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    display: 'block',
                                    marginBottom: '4px',
                                }}
                            >
                                Total Time
                            </Text>
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    lineHeight: 1,
                                }}
                            >
                                {totalTime}
                            </Text>
                            <Text
                                style={{
                                    color: 'rgba(255, 255, 255, 0.8)',
                                    fontSize: '14px',
                                    marginLeft: '4px',
                                }}
                            >
                                min
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Compact Ingredients */}
            {activeRecipe.ingredients && activeRecipe.ingredients.length > 0 && (
                <Card
                    style={{
                        marginBottom: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                    bodyStyle={{ padding: '16px 20px' }}
                >
                    <Text
                        strong
                        style={{
                            fontSize: '14px',
                            color: '#374151',
                            display: 'block',
                            marginBottom: '12px',
                        }}
                    >
                        Ingredients ({activeRecipe.ingredients.length})
                    </Text>
                    <Row gutter={[12, 12]}>
                        {activeRecipe.ingredients.map((ing, idx) => {
                            let displayQuantity = ing.quantity;
                            let displayUnit = ing.unit;

                            if (costedProduct?.latestCosting?.rawMaterials && activeRecipe.batchSize) {
                                const rawMaterial = costedProduct.latestCosting.rawMaterials.find(
                                    (rm) => rm.rawMaterialName === ing.name
                                );
                                if (rawMaterial?.batchCalculations?.[activeRecipe.batchSize]) {
                                    displayQuantity =
                                        rawMaterial.batchCalculations[activeRecipe.batchSize].kg;
                                    displayUnit = rawMaterial.units || ing.unit;
                                }
                            }

                            return (
                                <Col xs={12} sm={8} md={6} lg={4} key={ing.id || idx}>
                                    <div
                                        style={{
                                            background: '#f9fafb',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#458533';
                                            e.currentTarget.style.background = '#f0f9f4';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.background = '#f9fafb';
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{
                                                display: 'block',
                                                fontSize: '13px',
                                                color: '#374151',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            {ing.name}
                                        </Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'baseline',
                                                justifyContent: 'center',
                                                gap: '2px',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: '18px',
                                                    fontWeight: 700,
                                                    color: '#458533',
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {displayQuantity}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                }}
                                            >
                                                {displayUnit}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </Card>
            )}

            {/* Overall Progress Card */}
            {(executionStatus !== 'not_started' || sortedSteps.length > 0) && (
                <Card
                    style={{
                        marginBottom: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                    bodyStyle={{ padding: '20px 24px' }}
                >
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: '#f0f9f4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    ></div>
                                    <Text
                                        style={{
                                            fontSize: '14px',
                                            color: '#374151',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Overall Progress
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                    <Text
                                        style={{
                                            fontSize: '32px',
                                            fontWeight: 700,
                                            color: '#458533',
                                            lineHeight: 1,
                                        }}
                                    >
                                        {completedSteps}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: '18px',
                                            color: '#9ca3af',
                                        }}
                                    >
                                        / {sortedSteps.length}
                                    </Text>
                                </div>
                                <Progress
                                    percent={overallProgress}
                                    strokeColor="#458533"
                                    showInfo={false}
                                    strokeWidth={10}
                                />
                            </Space>
                        </Col>
                        {elapsedTime > 0 && (
                            <Col xs={24} sm={12} md={6}>
                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ClockCircleOutlined style={{ fontSize: '18px', color: '#458533' }} />
                                        <Text
                                            style={{
                                                fontSize: '14px',
                                                color: '#374151',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Elapsed Time
                                        </Text>
                                    </div>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: '28px',
                                            fontWeight: 700,
                                            color: '#458533',
                                            fontFamily: 'monospace',
                                        }}
                                    >
                                        {formatTime(elapsedTime * 60)}
                                    </Text>
                                </Space>
                            </Col>
                        )}
                        <Col xs={24} sm={12} md={6}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ClockCircleOutlined style={{ fontSize: '18px', color: '#458533' }} />
                                    <Text
                                        style={{
                                            fontSize: '14px',
                                            color: '#374151',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Total Time
                                    </Text>
                                </div>
                                <Text
                                    strong
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: 700,
                                        color: '#458533',
                                    }}
                                >
                                    {totalTime} min
                                </Text>
                            </Space>
                        </Col>
                        {executionStatus === 'not_started' && (
                            <Col xs={24} sm={24} md={6}>
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleStartRecipe}
                                    loading={actionLoading}
                                    block
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        background: '#458533',
                                        border: 'none',
                                        height: '48px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Start Recipe
                                </Button>
                            </Col>
                        )}
                    </Row>
                </Card>
            )}

            {/* Recipe Steps Grid */}
            {sortedSteps.length > 0 ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px',
                        width: '100%',
                    }}
                >
                    {sortedSteps.map((step, index) => {
                        const stepOrder = step.order || index + 1;
                        const stepStatus = getStepStatus(stepOrder);
                        const isCompleted = isStepCompleted(stepOrder);
                        const isCurrent = isCurrentStep(stepOrder);
                        const isActive = executionStatus === 'in_progress' && isCurrent;
                        const isPaused = executionStatus === 'paused' && isCurrent;
                        const canStart = canStartStep(stepOrder);

                        const { progress, remaining, elapsed } = getStepProgressData(stepOrder);
                        const isExpired = remaining === 0 && step.duration > 0;

                        return (
                            <Card
                                key={step.id || index}
                                style={{
                                    borderRadius: '12px',
                                    border: isActive
                                        ? '2px solid #458533'
                                        : isCompleted
                                        ? '2px solid #52c41a'
                                        : isPaused
                                        ? '2px solid #faad14'
                                        : '1px solid #e5e7eb',
                                    background: isActive
                                        ? '#f0f9f4'
                                        : isCompleted
                                        ? '#f6ffed'
                                        : isPaused
                                        ? '#fff7e6'
                                        : '#ffffff',
                                    boxShadow:
                                        isActive || isPaused
                                            ? '0 2px 8px rgba(69, 133, 51, 0.15)'
                                            : '0 1px 3px rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.2s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                                bodyStyle={{
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1,
                                }}
                            >
                                <Space
                                    direction="vertical"
                                    size={14}
                                    style={{ width: '100%', flex: 1 }}
                                >
                                    {/* Step Header */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: isCompleted
                                                    ? '#52c41a'
                                                    : isActive || isPaused
                                                    ? '#458533'
                                                    : '#f3f4f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            {isCompleted ? (
                                                <CheckCircleOutlined
                                                    style={{ fontSize: '20px', color: '#ffffff' }}
                                                />
                                            ) : (
                                                <Text
                                                    style={{
                                                        fontSize: '18px',
                                                        fontWeight: 700,
                                                        color:
                                                            isActive || isPaused ? '#ffffff' : '#6b7280',
                                                    }}
                                                >
                                                    {stepOrder}
                                                </Text>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#111827',
                                                    display: 'block',
                                                    marginBottom: '6px',
                                                }}
                                            >
                                                Step {stepOrder}
                                            </Text>
                                            <Space size={6} wrap>
                                                {step.temperature !== null &&
                                                    step.temperature !== undefined && (
                                                        <Tag
                                                            icon={<FireOutlined />}
                                                            style={{
                                                                background: '#fef2f2',
                                                                color: '#dc2626',
                                                                border: '1px solid #fecaca',
                                                                margin: 0,
                                                                fontSize: '11px',
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                            }}
                                                        >
                                                            {step.temperature}°C
                                                        </Tag>
                                                    )}
                                                <Tag
                                                    icon={<ClockCircleOutlined />}
                                                    style={{
                                                        background: '#eff6ff',
                                                        color: '#2563eb',
                                                        border: '1px solid #bfdbfe',
                                                        margin: 0,
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    {step.duration || 0}m
                                                </Tag>
                                            </Space>
                                        </div>
                                    </div>

                                    {/* Instruction */}
                                    <div
                                        style={{
                                            background: '#f9fafb',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            minHeight: '70px',
                                            border: '1px solid #f3f4f6',
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: '13px',
                                                color: '#374151',
                                                lineHeight: 1.6,
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {step.instruction || 'No instruction provided'}
                                        </Text>
                                    </div>

                                    {/* Timer Display */}
                                    {isActive && (
                                        <div>
                                            <Progress
                                                percent={progress}
                                                status={isExpired ? 'exception' : 'active'}
                                                strokeColor={isExpired ? '#ef4444' : '#458533'}
                                                showInfo={false}
                                                strokeWidth={8}
                                                style={{ marginBottom: '10px' }}
                                            />
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '14px',
                                                    background: isExpired
                                                        ? '#fef2f2'
                                                        : '#f0f9f4',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${isExpired ? '#fecaca' : '#b7eb8f'}`,
                                                }}
                                            >
                                                <Text
                                                    strong
                                                    style={{
                                                        fontSize: '28px',
                                                        fontWeight: 700,
                                                        color: isExpired ? '#dc2626' : '#458533',
                                                        fontFamily: 'monospace',
                                                        letterSpacing: '1px',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {formatTime(remaining)}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: '11px',
                                                        color: isExpired ? '#991b1b' : '#166534',
                                                        marginTop: '4px',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {isExpired ? 'Time Expired' : 'Remaining'}
                                                </Text>
                                            </div>
                                        </div>
                                    )}

                                    {isPaused && (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '14px',
                                                background: '#fff7e6',
                                                borderRadius: '10px',
                                                border: '2px solid #ffe58f',
                                            }}
                                        >
                                            <PauseCircleOutlined
                                                style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }}
                                            />
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#d46b08',
                                                    display: 'block',
                                                }}
                                            >
                                                Execution Paused
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: '12px',
                                                    color: '#d46b08',
                                                    marginTop: '4px',
                                                    display: 'block',
                                                }}
                                            >
                                                Resume execution to continue
                                            </Text>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <div style={{ marginTop: 'auto' }}>
                                        {isCompleted ? (
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                    background: '#f6ffed',
                                                    borderRadius: '8px',
                                                    border: '1px solid #b7eb8f',
                                                }}
                                            >
                                                <CheckCircleOutlined
                                                    style={{
                                                        color: '#52c41a',
                                                        marginRight: '6px',
                                                        fontSize: '16px',
                                                    }}
                                                />
                                                <Text strong style={{ fontSize: '13px', color: '#389e0d' }}>
                                                    Completed
                                                </Text>
                                            </div>
                                        ) : executionStatus === 'not_started' && stepOrder === 1 ? (
                                            <Button
                                                type="primary"
                                                icon={<PlayCircleOutlined />}
                                                onClick={handleStartRecipe}
                                                loading={actionLoading}
                                                block
                                                style={{
                                                    borderRadius: '8px',
                                                    background: '#458533',
                                                    border: 'none',
                                                    fontWeight: 500,
                                                    height: '38px',
                                                }}
                                            >
                                                Start Recipe
                                            </Button>
                                        ) : isActive ? (
                                            <Button
                                                type="primary"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleCompleteStep(stepOrder)}
                                                loading={actionLoading}
                                                block
                                                style={{
                                                    borderRadius: '8px',
                                                    background: '#52c41a',
                                                    border: 'none',
                                                    height: '38px',
                                                }}
                                            >
                                                Complete Step
                                            </Button>
                                        ) : isPaused ? (
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                    background: '#fff7e6',
                                                    borderRadius: '8px',
                                                    border: '1px solid #ffe58f',
                                                }}
                                            >
                                                <Text style={{ fontSize: '12px', color: '#d46b08' }}>
                                                    Use Resume Execution button above
                                                </Text>
                                            </div>
                                        ) : executionStatus === 'completed' ? (
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '10px',
                                                    background: '#f6ffed',
                                                    borderRadius: '8px',
                                                    border: '1px solid #b7eb8f',
                                                }}
                                            >
                                                <Text style={{ fontSize: '12px', color: '#389e0d' }}>
                                                    Recipe Completed
                                                </Text>
                                            </div>
                                        ) : (
                                            <Button
                                                disabled
                                                block
                                                style={{
                                                    borderRadius: '8px',
                                                    height: '38px',
                                                }}
                                            >
                                                Waiting for previous steps
                                            </Button>
                                        )}
                                    </div>
                                </Space>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Empty
                    description="No steps available in this recipe"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        </div>
    );
};

// Memoize component for performance (per guide recommendations)
export default memo(StartRecipe);
