import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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
    Checkbox,
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
    CheckSquareOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import * as taskService from '../../../service/taskService';
import alarmSound from '../../../assets/tones/end_task_timeing.mp3';
import taskStartSound from '../../../assets/tones/task_start.mp3';
import taskCompleteSound from '../../../assets/tones/after_hit_Complete_task_endpoint.wav';

const { Title, Text } = Typography;

const StartRecipe = ({ task, recipe, costedProduct, recipeExecution: initialRecipeExecution, onComplete, onError }) => {
    const [recipeExecution, setRecipeExecution] = useState(initialRecipeExecution);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [localElapsedTime, setLocalElapsedTime] = useState({}); // For real-time display (seconds)
    const [localRemainingTime, setLocalRemainingTime] = useState({}); // For countdown timer (seconds)
    const [progressUpdateInterval, setProgressUpdateInterval] = useState(null);
    const [alarmPlayedSteps, setAlarmPlayedSteps] = useState(new Set()); // Track which steps have played alarm
    const [checkedQuestions, setCheckedQuestions] = useState(new Set()); // Track which preparation questions are checked
    const audioRef = useRef(null); // Reference to alarm audio element
    const taskStartAudioRef = useRef(null); // Reference to task start audio element
    const taskCompleteAudioRef = useRef(null); // Reference to task complete audio element

    // PRE-MOVED HELPERS AND MEMOS TO FIX REFERENCE ERROR

    // Prefer recipe from execution, fallback to prop (per backend alignment doc)
    // Memoize activeRecipe for performance (per guide recommendations)
    const activeRecipe = useMemo(() => {
        console.log(recipeExecution);
        console.log(recipe);

        return recipeExecution?.recipe || recipe;
    }, [recipeExecution?.recipe, recipe]);

    // Helper function to combine steps and preparationQuestions into unified queue
    const getUnifiedSteps = useCallback((recipeData) => {
        if (!recipeData) return [];
        console.log(recipeData);
        const unifiedSteps = [];

        // Add recipe steps - sort by order first
        if (recipeData.steps && Array.isArray(recipeData.steps)) {
            const sortedSteps = [...recipeData.steps].sort((a, b) => (a.order || 0) - (b.order || 0));
            sortedSteps.forEach(step => {
                unifiedSteps.push({
                    id: step.id,
                    type: 'step',
                    order: step.order || 0,
                    instruction: step.instruction,
                    temperature: step.temperature,
                    duration: step.duration,
                });
            });
        }

        // Add preparation steps - sort by order first
        // FIXED: Use recipeData instead of recipe prop
        if (recipeData.preparationQuestions && recipeData.preparationQuestions.length > 0) {
            // Sort preparationQuestions by order before adding to unified queue
            // FIXED: Use recipeData instead of recipe prop
            const sortedPrepQuestions = [...recipeData.preparationQuestions].sort((a, b) => (a.order || 0) - (b.order || 0));

            sortedPrepQuestions.forEach(prepGroup => {
                // Ensure questions within each prep group maintain their order (preserve array order)
                const questions = prepGroup.questions || [];
                if (questions.length > 0 || prepGroup.order !== undefined) {
                    unifiedSteps.push({
                        id: prepGroup.id,
                        type: 'preparation',
                        order: prepGroup.order || 0,
                        questions: questions, // Questions are already in order from backend array
                    });
                }
            });
        }

        // Sort unified steps by order
        return unifiedSteps.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, []);

    // Memoize unified steps (includes both recipe steps and preparation steps) for performance
    const sortedSteps = useMemo(() => {

        return getUnifiedSteps(activeRecipe);
    }, [activeRecipe, getUnifiedSteps]);

    const totalTime = useMemo(() => {
        return activeRecipe?.totalTime || sortedSteps
            .filter(step => step.type === 'step')
            .reduce((sum, step) => sum + (step.duration || 0), 0);
    }, [activeRecipe?.totalTime, sortedSteps]);

    // Initialize state from backend execution data
    const initializeStateFromExecution = useCallback((execution) => {
        if (!execution || !execution.stepExecutions) return;

        // Use API response fields: currentStepElapsedTime and currentStepRemainingTime (in minutes)
        const elapsedForSteps = {};
        const remainingForSteps = {};

        // Get active recipe for step duration calculations
        const activeRecipe = execution.recipe || recipe;

        // If API provides currentStep with elapsedTime/remainingTime, use those
        if (execution.currentStep) {
            const stepIndex = execution.currentStep.stepOrder - 1;

            // Priority: Use currentStepElapsedTime from API (in minutes, excludes pause time)
            // Per RECIPE_TIMING_REIMPLEMENTATION.md: elapsedTime is accumulated
            if (execution.currentStepElapsedTime !== undefined && execution.currentStepElapsedTime !== null) {
                elapsedForSteps[stepIndex] = Math.round(execution.currentStepElapsedTime * 60); // Convert to seconds
            } else if (execution.currentStep?.elapsedTime !== undefined) {
                elapsedForSteps[stepIndex] = Math.round(execution.currentStep.elapsedTime * 60); // Convert to seconds
            }

            // Priority: Use currentStepRemainingTime from API (in minutes)
            // Per RECIPE_TIMING_REIMPLEMENTATION.md:
            // - When paused: remainingTime = remainingTimeAtPause (saved value)
            // - When in_progress: remainingTime = stepDuration - (stepElapsedTime + timeSinceResume)
            if (execution.status === 'paused' && execution.remainingTimeAtPause !== undefined && execution.remainingTimeAtPause !== null) {
                // When paused, use remainingTimeAtPause from execution (not currentStep)
                remainingForSteps[stepIndex] = Math.round(execution.remainingTimeAtPause * 60); // Convert to seconds
            } else if (execution.currentStepRemainingTime !== undefined && execution.currentStepRemainingTime !== null) {
                remainingForSteps[stepIndex] = Math.round(execution.currentStepRemainingTime * 60); // Convert to seconds
            } else if (execution.currentStep?.remainingTime !== undefined) {
                remainingForSteps[stepIndex] = Math.round(execution.currentStep.remainingTime * 60); // Convert to seconds
            } else {
                // Calculate remaining time from step duration if API value not available
                const step = activeRecipe?.steps?.find((s) => s.order === execution.currentStep.stepOrder);
                if (step && step.duration) {
                    const stepDurationSeconds = step.duration * 60;
                    const elapsed = elapsedForSteps[stepIndex] || 0;
                    remainingForSteps[stepIndex] = Math.max(0, stepDurationSeconds - elapsed);
                }
            }
        }

        // Fallback: Calculate from stepExecutions if API fields not available
        execution.stepExecutions.forEach((stepExec) => {
            const stepIndex = stepExec.stepOrder - 1;

            if (stepExec.startedAt) {
                if (stepExec.status === 'in_progress' && !elapsedForSteps[stepIndex]) {
                    // Step is currently running - calculate elapsed from startedAt
                    const started = dayjs(stepExec.startedAt);
                    const now = dayjs();
                    const elapsedSeconds = now.diff(started, 'second');
                    elapsedForSteps[stepIndex] = elapsedSeconds;
                } else if (stepExec.status === 'paused' && !elapsedForSteps[stepIndex]) {
                    // Step is paused - use actualDuration if available
                    if (stepExec.actualDuration !== undefined && stepExec.actualDuration !== null) {
                        elapsedForSteps[stepIndex] = Math.round(stepExec.actualDuration * 60);
                    } else if (stepExec.pausedAt) {
                        const started = dayjs(stepExec.startedAt);
                        const paused = dayjs(stepExec.pausedAt);
                        elapsedForSteps[stepIndex] = paused.diff(started, 'second');
                    }
                } else if (stepExec.completedAt && stepExec.startedAt && !elapsedForSteps[stepIndex]) {
                    // Step is completed
                    const started = dayjs(stepExec.startedAt);
                    const completed = dayjs(stepExec.completedAt);
                    elapsedForSteps[stepIndex] = completed.diff(started, 'second');
                }
            }
        });

        // Set elapsed and remaining time states for all steps first
        setLocalElapsedTime((prev) => ({
            ...prev,
            ...elapsedForSteps,
        }));

        setLocalRemainingTime((prev) => ({
            ...prev,
            ...remainingForSteps,
        }));

        // Start timer ONLY if execution is in_progress (not paused, not completed, etc.)
        // Per RECIPE_TIMING_REIMPLEMENTATION.md: Timer only runs when status is IN_PROGRESS
        if (execution.status === 'in_progress' && execution.currentStep) {
            const stepIndex = execution.currentStep.stepOrder - 1;

            // Get initial values from API response (already set in remainingForSteps and elapsedForSteps)
            let initialRemainingSeconds = remainingForSteps[stepIndex];
            let initialElapsedSeconds = elapsedForSteps[stepIndex] || 0;

            // If remaining time not set, try to get from API directly
            if (initialRemainingSeconds === undefined || initialRemainingSeconds === null) {
                // Try to get from execution.currentStepRemainingTime
                if (execution.currentStepRemainingTime !== undefined && execution.currentStepRemainingTime !== null) {
                    initialRemainingSeconds = Math.round(execution.currentStepRemainingTime * 60);
                } else if (execution.currentStep?.remainingTime !== undefined) {
                    initialRemainingSeconds = Math.round(execution.currentStep.remainingTime * 60);
                } else {
                    // Calculate from step duration if API value not available
                    const step = activeRecipe?.steps?.find((s) => s.order === execution.currentStep.stepOrder);
                    if (step && step.duration) {
                        const stepDurationSeconds = step.duration * 60;
                        initialRemainingSeconds = Math.max(0, stepDurationSeconds - initialElapsedSeconds);
                    }
                }
            }

            // Ensure we have valid values
            if (initialRemainingSeconds === undefined || initialRemainingSeconds === null || initialRemainingSeconds < 0) {
                // Fallback: use step duration
                const step = activeRecipe?.steps?.find((s) => s.order === execution.currentStep.stepOrder);
                if (step && step.duration) {
                    const stepDurationSeconds = step.duration * 60;
                    initialRemainingSeconds = Math.max(0, stepDurationSeconds - initialElapsedSeconds);
                } else {
                    initialRemainingSeconds = 0;
                }
            }

            // Update state with calculated values
            setLocalRemainingTime((prev) => ({
                ...prev,
                [stepIndex]: initialRemainingSeconds,
            }));

            setLocalElapsedTime((prev) => ({
                ...prev,
                [stepIndex]: initialElapsedSeconds,
            }));

            // Clear existing interval and start new timer
            setProgressUpdateInterval((prevInterval) => {
                if (prevInterval) {
                    clearInterval(prevInterval);
                }

                // Start timer with initial values from API
                // Use local variables in closure to track current values
                let currentRemaining = initialRemainingSeconds;
                let currentElapsed = initialElapsedSeconds;

                const interval = setInterval(() => {
                    // Countdown remaining time and count up elapsed time
                    if (currentRemaining > 0) {
                        currentRemaining -= 1;
                        currentElapsed += 1;

                        // Update state every second
                        setLocalRemainingTime((prev) => ({
                            ...prev,
                            [stepIndex]: currentRemaining,
                        }));

                        setLocalElapsedTime((prev) => ({
                            ...prev,
                            [stepIndex]: currentElapsed,
                        }));
                    } else {
                        // Timer reached 0, stop the interval
                        clearInterval(interval);
                    }
                }, 1000);

                return interval;
            });
        } else {
            // Stop timer for any other status (paused, completed, cancelled, etc.)
            setProgressUpdateInterval((prevInterval) => {
                if (prevInterval) {
                    clearInterval(prevInterval);
                }
                return null;
            });
        }
    }, [recipe]);

    // Initialize state from recipeExecution on mount or when it changes
    useEffect(() => {
        if (recipeExecution) {
            initializeStateFromExecution(recipeExecution);
            // Reset alarm tracking when execution changes (new step started or execution restarted)
            setAlarmPlayedSteps(new Set());
        } else {
            // No execution yet - initialize empty state
            resetState();
            setAlarmPlayedSteps(new Set());
        }
    }, [recipeExecution?.id, recipeExecution?.status, recipeExecution?.currentStep?.stepOrder]); // eslint-disable-line

    // Load initial checked state from recipe execution
    useEffect(() => {
        if (activeRecipe?.preparationQuestions) {
            const initialChecked = new Set();

            // Loop through preparation questions and check for 'checked' property
            // This matches the backend structure where checked status is injected into the recipe object
            activeRecipe.preparationQuestions.forEach(prepGroup => {
                if (prepGroup.questions) {
                    prepGroup.questions.forEach((question, index) => {
                        if (question.checked) {
                            // Generate key matching the format used in render
                            const questionIndex = index;
                            const prepStepIndex = sortedSteps.findIndex(s => s.id === prepGroup.id);
                            // Ensure reliable key generation
                            const stepId = prepGroup.id || `prep-${prepStepIndex}`;
                            const qId = question.id || `q-${questionIndex}`;
                            const questionKey = `${stepId}-${qId}`;

                            initialChecked.add(questionKey);
                        }
                    });
                }
            });

            setCheckedQuestions(initialChecked);
        } else {
            setCheckedQuestions(new Set());
        }
    }, [activeRecipe, sortedSteps]);

    const resetState = () => {
        setLocalElapsedTime({});
        setLocalRemainingTime({});
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

    // Check for timer expiration and play alarm
    useEffect(() => {
        if (recipeExecution?.status === 'in_progress' && recipeExecution?.currentStep) {
            const currentStepOrder = recipeExecution.currentStep.stepOrder;
            const stepIndex = currentStepOrder - 1;
            const elapsed = localElapsedTime[stepIndex] || 0;

            const activeRecipe = recipeExecution?.recipe || recipe;
            const step = activeRecipe?.steps?.find((s) => s.order === currentStepOrder);
            const stepExec = recipeExecution.stepExecutions?.find(
                (se) => se.stepOrder === currentStepOrder
            );

            if (step && stepExec?.startedAt && step.duration > 0) {
                const durationSeconds = step.duration * 60;
                const remaining = Math.max(0, durationSeconds - elapsed);

                // Play alarm when timer reaches 0 (only once per step)
                if (remaining === 0) {
                    const stepKey = `${recipeExecution.id || 'default'}-${currentStepOrder}`;
                    setAlarmPlayedSteps((prevSet) => {
                        if (!prevSet.has(stepKey)) {
                            // Play alarm
                            if (audioRef.current) {
                                audioRef.current.play().catch((err) => {
                                    console.error('Error playing alarm:', err);
                                });
                            }
                            return new Set([...prevSet, stepKey]);
                        }
                        return prevSet;
                    });
                }
            }
        }
    }, [localElapsedTime, recipeExecution, recipe]);

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

                // Play task start sound on success
                if (taskStartAudioRef.current) {
                    taskStartAudioRef.current.play().catch((err) => {
                        console.error('Error playing task start sound:', err);
                    });
                }

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
            // Stop the timer immediately
            stopLocalTimer();

            // Calculate remaining time from local state (convert seconds to minutes)
            const currentStepOrder = recipeExecution?.currentStep?.stepOrder;
            let remainingTimeMinutes = null;
            let stepDurationMinutes = null;

            if (currentStepOrder) {
                const stepIndex = currentStepOrder - 1;
                const remainingSeconds = localRemainingTime[stepIndex];
                if (remainingSeconds !== undefined && remainingSeconds !== null) {
                    // Convert seconds to minutes (with 1 decimal precision)
                    remainingTimeMinutes = Math.round((remainingSeconds / 60) * 10) / 10;
                }

                // Get step duration for validation
                const activeRecipe = recipeExecution?.recipe || recipe;
                const step = activeRecipe?.steps?.find((s) => s.order === currentStepOrder);
                if (step && step.duration) {
                    stepDurationMinutes = step.duration;
                }
            }

            // Validate remainingTime <= stepDuration (per API documentation)
            if (remainingTimeMinutes !== null && stepDurationMinutes !== null && remainingTimeMinutes > stepDurationMinutes) {
                message.error(`Invalid remaining time: ${remainingTimeMinutes} minutes. Remaining time cannot be greater than step duration (${stepDurationMinutes} minutes).`);
                setActionLoading(false);
                return;
            }

            // Prepare pause data with remainingTime (reason can be added later if needed)
            const pauseData = {};
            if (remainingTimeMinutes !== null) {
                pauseData.remainingTime = remainingTimeMinutes;
            }

            const response = await taskService.pauseRecipeExecution(task.taskId, pauseData);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);

                // Reinitialize state to ensure timer is stopped for paused status
                // This will update state with API values and stop the timer
                initializeStateFromExecution(executionData);
                message.success('Recipe execution paused');
            }
        } catch (error) {
            console.error('Error pausing recipe execution:', error);
            const errorMsg = error.response?.data?.message || 'Failed to pause recipe execution';
            message.error(errorMsg);
            // Ensure timer is stopped even on error
            stopLocalTimer();
        } finally {
            setActionLoading(false);
        }
    };

    // Resume recipe execution
    const handleResumeRecipe = async () => {
        if (!task?.id) return;

        try {
            setActionLoading(true);

            // Calculate remaining time from local state (convert seconds to minutes)
            const currentStepOrder = recipeExecution?.currentStep?.stepOrder;
            let remainingTimeMinutes = null;

            if (currentStepOrder) {
                const stepIndex = currentStepOrder - 1;
                const remainingSeconds = localRemainingTime[stepIndex];
                if (remainingSeconds !== undefined && remainingSeconds !== null) {
                    // Convert seconds to minutes (with 1 decimal precision)
                    remainingTimeMinutes = Math.round((remainingSeconds / 60) * 10) / 10;
                }
            }

            // Prepare resume data with remainingTime
            const resumeData = {};
            if (remainingTimeMinutes !== null) {
                resumeData.remainingTime = remainingTimeMinutes;
            }

            const response = await taskService.resumeRecipeExecution(task.taskId, resumeData);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);

                // Reinitialize to restart timer with new remaining time from API
                // This will properly restart the timer with the correct values
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

    // Start a specific step manually
    const handleStartStep = async (stepOrder) => {
        if (!task?.id) return;

        try {
            setActionLoading(true);
            const response = await taskService.startStep(task.taskId, stepOrder);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);
                message.success(`Step ${stepOrder} started`);
            }
        } catch (error) {
            console.error('Error starting step:', error);
            const errorMsg = error.response?.data?.message || 'Failed to start step';
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

            // Calculate remaining time from local state (convert seconds to minutes)
            const stepIndex = stepOrder - 1;
            let remainingTimeMinutes = null;
            const remainingSeconds = localRemainingTime[stepIndex];

            if (remainingSeconds !== undefined && remainingSeconds !== null) {
                // Convert seconds to minutes (with 1 decimal precision)
                remainingTimeMinutes = Math.round((remainingSeconds / 60) * 10) / 10;
            }

            // Prepare completion data - use remainingTime (priority) or actualDuration (fallback)
            const completionData = {};

            // Priority: Use remainingTime if available
            if (remainingTimeMinutes !== null) {
                completionData.remainingTime = remainingTimeMinutes;
            } else {
                // Fallback: Calculate actualDuration from timestamps
                const currentStepExec = recipeExecution?.stepExecutions?.find(
                    (se) => se.stepOrder === stepOrder
                );
                if (currentStepExec?.startedAt) {
                    const started = dayjs(currentStepExec.startedAt);
                    const now = dayjs();
                    const actualDuration = now.diff(started, 'minute', true); // In minutes with decimals
                    completionData.actualDuration = Math.round(actualDuration * 10) / 10; // Round to 1 decimal
                }
            }

            const response = await taskService.completeStep(task.taskId, stepOrder, completionData);
            if (response.data) {
                const executionData = response.data?.data || response.data;
                setRecipeExecution(executionData);
                initializeStateFromExecution(executionData);

                // Play task complete sound on success
                if (taskCompleteAudioRef.current) {
                    taskCompleteAudioRef.current.play().catch((err) => {
                        console.error('Error playing task complete sound:', err);
                    });
                }

                // Check if execution is completed
                if (executionData.status === 'completed') {
                    message.success('All steps completed successfully!');
                    // Call onComplete callback if provided (per guide recommendations)
                    if (onComplete) {
                        onComplete(executionData);
                    }
                } else {
                    message.success(`Step ${stepOrder} completed successfully.`);
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

    // Helper function to generate question key (must match the format used in rendering)
    // Format: `${item.id || `prep-${index}`}-${question.id || `q-${qIdx}`}`
    const getQuestionKey = useCallback((prepStepId, questionId, sortedStepsIndex, qIdx) => {
        return `${prepStepId || `prep-${sortedStepsIndex}`}-${questionId || `q-${qIdx}`}`;
    }, []);

    // Check if all preparation steps before a given step order are completed
    const arePreparationStepsCompleted = useCallback((stepOrder) => {
        // Get all preparation steps that come before this step order
        // We need to check them in the order they appear in sortedSteps to get the correct index
        for (let sortedIdx = 0; sortedIdx < sortedSteps.length; sortedIdx++) {
            const step = sortedSteps[sortedIdx];

            // Skip if not a preparation step or if order is >= stepOrder
            if (step.type !== 'preparation' || step.order >= stepOrder) {
                continue;
            }

            if (!step.questions || step.questions.length === 0) {
                continue; // Skip if no questions
            }

            // Check if all questions with hasCheckbox are checked
            for (let qIdx = 0; qIdx < step.questions.length; qIdx++) {
                const question = step.questions[qIdx];
                if (question.hasCheckbox) {
                    const questionKey = getQuestionKey(step.id, question.id, sortedIdx, qIdx);
                    if (!checkedQuestions.has(questionKey)) {
                        return false; // At least one checkbox is not checked
                    }
                }
            }
        }

        return true; // All preparation steps are completed
    }, [sortedSteps, checkedQuestions, getQuestionKey]);

    // Get the first incomplete preparation step before a given step order
    const getFirstIncompletePreparationStep = useCallback((stepOrder) => {
        // Check them in the order they appear in sortedSteps to get the correct index
        for (let sortedIdx = 0; sortedIdx < sortedSteps.length; sortedIdx++) {
            const step = sortedSteps[sortedIdx];

            // Skip if not a preparation step or if order is >= stepOrder
            if (step.type !== 'preparation' || step.order >= stepOrder) {
                continue;
            }

            if (!step.questions || step.questions.length === 0) {
                continue;
            }

            for (let qIdx = 0; qIdx < step.questions.length; qIdx++) {
                const question = step.questions[qIdx];
                if (question.hasCheckbox) {
                    const questionKey = getQuestionKey(step.id, question.id, sortedIdx, qIdx);
                    if (!checkedQuestions.has(questionKey)) {
                        return step; // Return the first incomplete preparation step
                    }
                }
            }
        }

        return null; // All preparation steps are completed
    }, [sortedSteps, checkedQuestions, getQuestionKey]);

    const canStartStep = (stepOrder) => {
        // Can start if:
        // 1. Execution is not_started and it's the first step
        // 2. Execution is in_progress and all previous steps are completed
        // 3. No current step is active (unless this is the current step)
        // 4. All preparation steps before this step are completed

        if (executionStatus === 'completed' || executionStatus === 'cancelled') {
            return false;
        }

        // Check if all preparation steps before this step are completed
        if (!arePreparationStepsCompleted(stepOrder)) {
            return false;
        }

        if (executionStatus === 'not_started') {
            // For the first step, also check if there are any preparation steps before it
            return stepOrder === 1 && arePreparationStepsCompleted(1);
        }

        if (executionStatus === 'paused') {
            // Can only resume current step when paused
            return isCurrentStep(stepOrder);
        }

        if (executionStatus === 'in_progress') {
            // Check if previous recipe steps are completed (skip preparation steps)
            const recipeStepsBefore = sortedSteps
                .filter(s => s.type === 'step' && s.order < stepOrder)
                .map(s => s.order);

            for (const prevStepOrder of recipeStepsBefore) {
                if (!isStepCompleted(prevStepOrder)) {
                    return false;
                }
            }
            // Can start if no current step is active (allows manual start of next step)
            // or this is the current step (for resuming)
            return !currentStep || isCurrentStep(stepOrder);
        }

        // After completion, if execution is still in_progress but no current step,
        // allow starting the next step
        if (executionStatus === 'in_progress' && !currentStep) {
            // Check if all previous recipe steps are completed (skip preparation steps)
            const recipeStepsBefore = sortedSteps
                .filter(s => s.type === 'step' && s.order < stepOrder)
                .map(s => s.order);

            for (const prevStepOrder of recipeStepsBefore) {
                if (!isStepCompleted(prevStepOrder)) {
                    return false;
                }
            }
            return true;
        }

        return false;
    };

    // Calculate step progress and remaining time (per backend alignment doc)
    const getStepProgressData = (stepOrder) => {
        const stepExec = getStepExecution(stepOrder);
        // Use recipe.steps[stepOrder - 1] for duration (per backend alignment doc - stepOrder is 1-based)
        // Only find recipe steps (not preparation steps)
        const step = sortedSteps.find((s) => s.order === stepOrder && s.type === 'step');

        if (!step || step.type !== 'step') return { progress: 0, remaining: 0, elapsed: 0 };

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

        // Calculate elapsed time and remaining time (use API values when available)
        let elapsed = 0;
        let remaining = 0;

        // Priority: Use local state values for real-time updates
        if (localElapsedTime[stepOrder - 1] !== undefined) {
            elapsed = localElapsedTime[stepOrder - 1];
        }
        if (localRemainingTime[stepOrder - 1] !== undefined) {
            remaining = localRemainingTime[stepOrder - 1];
        }

        // Secondary Priority: Use API response values (currentStepElapsedTime/currentStepRemainingTime)
        // Only if local values are not available (e.g. initial load)
        if (isCurrentStep(stepOrder)) {
            // Use API values from recipeExecution if available
            if (!elapsed) {
                if (recipeExecution.currentStepElapsedTime !== undefined && recipeExecution.currentStepElapsedTime !== null) {
                    elapsed = Math.round(recipeExecution.currentStepElapsedTime * 60);
                } else if (recipeExecution.currentStep?.elapsedTime !== undefined) {
                    elapsed = Math.round(recipeExecution.currentStep.elapsedTime * 60);
                }
            }

            if (!remaining) {
                if (recipeExecution.currentStepRemainingTime !== undefined && recipeExecution.currentStepRemainingTime !== null) {
                    remaining = Math.round(recipeExecution.currentStepRemainingTime * 60);
                } else if (recipeExecution.currentStep?.remainingTime !== undefined) {
                    remaining = Math.round(recipeExecution.currentStep.remainingTime * 60);
                }
            }
        }

        // Fallback: Use local state values
        if (!elapsed && localElapsedTime[stepOrder - 1] !== undefined) {
            elapsed = localElapsedTime[stepOrder - 1];
        }
        if (!remaining && localRemainingTime[stepOrder - 1] !== undefined) {
            remaining = localRemainingTime[stepOrder - 1];
        }

        // Final fallback: Calculate from stepExec if API/local values not available
        if (!elapsed && stepExec?.startedAt) {
            if (stepExec.status === 'in_progress') {
                elapsed = localElapsedTime[stepOrder - 1] || 0;
                if (!elapsed) {
                    const started = dayjs(stepExec.startedAt);
                    const now = dayjs();
                    elapsed = now.diff(started, 'second');
                }
            } else if (stepExec.status === 'paused') {
                elapsed = localElapsedTime[stepOrder - 1] || 0;
                if (!elapsed && stepExec.actualDuration !== undefined) {
                    elapsed = Math.round(stepExec.actualDuration * 60);
                }
            } else if (stepExec.completedAt && stepExec.startedAt) {
                const started = dayjs(stepExec.startedAt);
                const completed = dayjs(stepExec.completedAt);
                elapsed = completed.diff(started, 'second');
            }
        }

        // Calculate remaining if not set from API
        if (!remaining) {
            const durationSeconds = (step.duration || 0) * 60;
            remaining = Math.max(0, durationSeconds - elapsed);
        }

        return { progress, remaining, elapsed };
    };

    // Calculate local completed steps count including preparation steps
    const displayCompletedSteps = useMemo(() => {
        if (!sortedSteps.length) return 0;

        let count = 0;
        sortedSteps.forEach(step => {
            if (step.type === 'preparation') {
                // Check if all questions in this prep step are checked
                const allChecked = step.questions?.every((q, i) => {
                    if (!q.hasCheckbox) return true;
                    // Reconstruct key logic from getQuestionKey
                    // Since specific index might vary, we rely on the implementation matching
                    // But simpler: just check if we have enough checked items matching this prep step ID?
                    // No, keys are unique. 
                    // Let's use the same logic as render
                    // We need strict match.

                    // Note: sortedSteps index might not match original recipe prep index if mixed?
                    // sortedSteps is what defines the order.

                    // We need to look up the question key.
                    // But question key depends on `index` in sortedSteps?
                    // In render: `const questionKey = ${item.id || `prep-${index}`}-${question.id || `q-${qIdx}`};`
                    // 'index' is the map index in render.

                    // Let's find index of this step in sortedSteps
                    const stepIndex = sortedSteps.indexOf(step);
                    const key = `${step.id || `prep-${stepIndex}`}-${q.id || `q-${i}`}`;
                    return checkedQuestions.has(key);
                });
                if (allChecked) {
                    count++;
                }
            } else {
                // Recipe step
                if (isStepCompleted(step.order)) {
                    count++;
                }
            }
        });
        return count;
    }, [sortedSteps, checkedQuestions, isStepCompleted]);

    const displayOverallProgress = useMemo(() => {
        if (!sortedSteps.length) return 0;
        return Math.round((displayCompletedSteps / sortedSteps.length) * 100);
    }, [displayCompletedSteps, sortedSteps.length]);

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
                                {recipeExecution?.remainingTimeForTask !== undefined && recipeExecution.remainingTimeForTask !== null && (
                                    <Text type="secondary" style={{ fontSize: '13px' }}>
                                        Remaining: {Math.round(recipeExecution.remainingTimeForTask * 10) / 10} min
                                    </Text>
                                )}
                                {executionStatus === 'paused' && recipeExecution?.pauseReason && (
                                    <Text type="secondary" style={{ fontSize: '13px', fontStyle: 'italic' }}>
                                        Reason: {recipeExecution.pauseReason}
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
                                        {displayCompletedSteps}
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
                                    percent={displayOverallProgress}
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
                        {executionStatus === 'not_started' && (() => {
                            // Find the first recipe step order
                            const firstRecipeStep = sortedSteps.find(s => s.type === 'step');
                            const firstStepOrder = firstRecipeStep ? firstRecipeStep.order : 1;

                            // Check if all preparation steps before the first recipe step are completed
                            const prepStepsCompleted = arePreparationStepsCompleted(firstStepOrder);
                            const incompletePrepStep = getFirstIncompletePreparationStep(firstStepOrder);

                            return (
                                <Col xs={24} sm={24} md={6}>
                                    <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        onClick={handleStartRecipe}
                                        loading={actionLoading}
                                        disabled={!prepStepsCompleted}
                                        block
                                        size="large"
                                        style={{
                                            borderRadius: '8px',
                                            background: prepStepsCompleted ? '#458533' : '#d9d9d9',
                                            border: 'none',
                                            height: '48px',
                                            fontSize: '16px',
                                            fontWeight: 600,
                                            cursor: prepStepsCompleted ? 'pointer' : 'not-allowed',
                                        }}
                                        title={!prepStepsCompleted && incompletePrepStep
                                            ? `Complete Preparation Step ${incompletePrepStep.order} first`
                                            : ''}
                                    >
                                        Start Recipe
                                    </Button>
                                    {!prepStepsCompleted && incompletePrepStep && (
                                        <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                            <Text type="warning" style={{ fontSize: '12px' }}>
                                                Complete Preparation Step {incompletePrepStep.order} first
                                            </Text>
                                        </div>
                                    )}
                                </Col>
                            );
                        })()}
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
                    {sortedSteps.map((item, index) => {
                        // Handle preparation steps differently
                        if (item.type === 'preparation') {
                            return (
                                <Card
                                    key={item.id || `prep-${index}`}
                                    style={{
                                        borderRadius: '12px',
                                        border: '1px solid #8b5cf6',
                                        background: '#faf5ff',
                                        boxShadow: '0 1px 3px rgba(139, 92, 246, 0.1)',
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
                                    <Space direction="vertical" size={14} style={{ width: '100%', flex: 1 }}>
                                        {/* Preparation Header */}
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: '18px',
                                                        fontWeight: 700,
                                                        color: '#ffffff',
                                                    }}
                                                >
                                                    {item.order || index + 1}
                                                </Text>
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
                                                    Preparation / Checking Step {item.order || index + 1}
                                                </Text>
                                                <Tag
                                                    icon={<CheckSquareOutlined />}
                                                    style={{
                                                        background: '#ede9fe',
                                                        color: '#7c3aed',
                                                        border: '1px solid #c4b5fd',
                                                        margin: 0,
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    Checklist
                                                </Tag>
                                            </div>
                                        </div>

                                        {/* Questions */}
                                        <div
                                            style={{
                                                background: '#f9fafb',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                minHeight: '70px',
                                                border: '1px solid #f3f4f6',
                                            }}
                                        >
                                            {item.questions && item.questions.length > 0 ? (
                                                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                    {item.questions.map((question, qIdx) => {
                                                        const questionKey = `${item.id || `prep-${index}`}-${question.id || `q-${qIdx}`}`;
                                                        const isChecked = checkedQuestions.has(questionKey);

                                                        // Check if all questions in this step are checked
                                                        const allChecked = item.questions.every((q, i) => {
                                                            if (!q.hasCheckbox) return true;
                                                            const key = `${item.id || `prep-${index}`}-${q.id || `q-${i}`}`;
                                                            return checkedQuestions.has(key);
                                                        });

                                                        return (
                                                            <div
                                                                key={question.id || `q-${qIdx}`}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    gap: '8px',
                                                                    padding: '8px',
                                                                    background: isChecked ? '#f0f9f4' : '#fff', // Slight green tint when checked
                                                                    borderRadius: '6px',
                                                                    border: isChecked ? '1px solid #b7eb8f' : '1px solid #e5e7eb',
                                                                    cursor: allChecked ? 'not-allowed' : (question.hasCheckbox ? 'pointer' : 'default'),
                                                                    transition: 'all 0.2s',
                                                                    opacity: allChecked && !isChecked ? 0.6 : 1,
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (question.hasCheckbox && !allChecked) {
                                                                        e.currentTarget.style.borderColor = '#8b5cf6';
                                                                        e.currentTarget.style.background = '#faf5ff';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (question.hasCheckbox) {
                                                                        // Reset to default or checked style
                                                                        if (isChecked) {
                                                                            e.currentTarget.style.borderColor = '#b7eb8f';
                                                                            e.currentTarget.style.background = '#f0f9f4';
                                                                        } else {
                                                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                                                            e.currentTarget.style.background = '#fff';
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                {question.hasCheckbox ? (
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        disabled={allChecked}
                                                                        onChange={async (e) => {
                                                                            e.stopPropagation();
                                                                            const newCheckedState = e.target.checked;

                                                                            // Optimistically update UI
                                                                            setCheckedQuestions(prev => {
                                                                                const newSet = new Set(prev);
                                                                                if (newCheckedState) {
                                                                                    newSet.add(questionKey);
                                                                                } else {
                                                                                    newSet.delete(questionKey);
                                                                                }
                                                                                return newSet;
                                                                            });

                                                                            // Update backend
                                                                            if (task?.id && item.id && question.id) {
                                                                                try {
                                                                                    await taskService.updatePreparationQuestionStatus(
                                                                                        task.id,
                                                                                        item.id,
                                                                                        question.id,
                                                                                        { checked: newCheckedState }
                                                                                    );
                                                                                    // Success - UI already updated optimistically
                                                                                } catch (error) {
                                                                                    console.error('Error updating preparation question status:', error);
                                                                                    // Revert optimistic update on error
                                                                                    setCheckedQuestions(prev => {
                                                                                        const newSet = new Set(prev);
                                                                                        if (newCheckedState) {
                                                                                            newSet.delete(questionKey);
                                                                                        } else {
                                                                                            newSet.add(questionKey);
                                                                                        }
                                                                                        return newSet;
                                                                                    });
                                                                                    message.error('Failed to update preparation question status');
                                                                                }
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            marginTop: '2px',
                                                                            flexShrink: 0,
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <Text
                                                                    style={{
                                                                        fontSize: '13px',
                                                                        color: '#374151',
                                                                        lineHeight: 1.5,
                                                                        flex: 1,
                                                                    }}
                                                                >
                                                                    {question.question || 'No question provided'}
                                                                </Text>
                                                            </div>
                                                        );
                                                    })}
                                                </Space>
                                            ) : (
                                                <Text style={{ fontSize: '13px', color: '#6b7280' }}>
                                                    No questions available
                                                </Text>
                                            )}
                                        </div>

                                        {/* Info message for preparation steps */}
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                padding: '10px',
                                                background: '#f3f4f6',
                                                borderRadius: '8px',
                                                border: '1px solid #e5e7eb',
                                            }}
                                        >
                                            <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                                                Complete checklist before proceeding
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            );
                        }

                        // Handle recipe steps (existing logic)
                        const stepOrder = item.order || index + 1;
                        const stepStatus = getStepStatus(stepOrder);
                        const isCompleted = isStepCompleted(stepOrder);
                        const isCurrent = isCurrentStep(stepOrder);
                        const isActive = executionStatus === 'in_progress' && isCurrent;
                        const isPaused = executionStatus === 'paused' && isCurrent;
                        const canStart = canStartStep(stepOrder);
                        const prepStepsCompleted = arePreparationStepsCompleted(stepOrder);
                        const incompletePrepStep = getFirstIncompletePreparationStep(stepOrder);
                        // Check if this is the next step that can be started (after last completed step)
                        // Only consider recipe steps, not preparation steps
                        const isNextStep = executionStatus === 'in_progress' && !currentStep &&
                            isCompleted === false &&
                            item.type === 'step' &&
                            prepStepsCompleted &&
                            sortedSteps
                                .slice(0, index)
                                .filter(s => s.type === 'step')
                                .every((s) => isStepCompleted(s.order));

                        const { progress, remaining, elapsed } = getStepProgressData(stepOrder);
                        const isExpired = remaining === 0 && item.duration > 0;

                        return (
                            <Card
                                key={item.id || index}
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
                                                {item.temperature !== null &&
                                                    item.temperature !== undefined && (
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
                                                            {item.temperature}°C
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
                                                    {item.duration || 0}m
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
                                            {item.instruction || 'No instruction provided'}
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
                                            prepStepsCompleted ? (
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
                                            ) : incompletePrepStep ? (
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
                                                        Complete Preparation Step {incompletePrepStep.order} first
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
                                                    Complete preparation steps first
                                                </Button>
                                            )
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
                                        ) : isNextStep && prepStepsCompleted ? (
                                            <Button
                                                type="primary"
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => handleStartStep(stepOrder)}
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
                                                Start Next Step
                                            </Button>
                                        ) : isNextStep && !prepStepsCompleted && incompletePrepStep ? (
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
                                                    Complete Preparation Step {incompletePrepStep.order} first
                                                </Text>
                                            </div>
                                        ) : canStart && !isCurrent && prepStepsCompleted ? (
                                            <Button
                                                type="primary"
                                                icon={<PlayCircleOutlined />}
                                                onClick={() => handleStartStep(stepOrder)}
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
                                                Start Step
                                            </Button>
                                        ) : !prepStepsCompleted && incompletePrepStep ? (
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
                                                    Complete Preparation Step {incompletePrepStep.order} first
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

            {/* Hidden audio elements */}
            <audio
                ref={audioRef}
                src={alarmSound}
                preload="auto"
                style={{ display: 'none' }}
            />
            <audio
                ref={taskStartAudioRef}
                src={taskStartSound}
                preload="auto"
                style={{ display: 'none' }}
            />
            <audio
                ref={taskCompleteAudioRef}
                src={taskCompleteSound}
                preload="auto"
                style={{ display: 'none' }}
            />
        </div>
    );
};

// Memoize component for performance (per guide recommendations)
export default memo(StartRecipe);
