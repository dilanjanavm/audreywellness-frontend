import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  taskList: [],
  isTaskCreated: false,
  isTaskSuccess: false,
  error: null,
};

const tasksSlice = createSlice({
  name: "Tasks",
  initialState,
  reducers: {
    getTaskListSuccess(state, action) {
      state.taskList = action.payload;
      state.isTaskSuccess = true;
      state.error = null;
    },
    getTaskListFail(state, action) {
      state.error = action.payload;
      state.isTaskSuccess = false;
    },
    addNewTaskSuccess(state, action) {
      state.taskList = [...state.taskList, action.payload];
      state.isTaskCreated = true;
      state.error = null;
    },
    addNewTaskFail(state, action) {
      state.error = action.payload;
      state.isTaskCreated = false;
    },
    updateTaskSuccess(state, action) {
      state.taskList = state.taskList.map((task) =>
        (task._id === action.payload._id || task.id === action.payload.id) ? action.payload : task
      );
      state.isTaskCreated = true;
      state.error = null;
    },
    updateTaskFail(state, action) {
      state.error = action.payload;
      state.isTaskCreated = false;
    },
    deleteTaskSuccess(state, action) {
      state.taskList = state.taskList.filter(
        (task) => task._id !== action.payload
      );
      state.isTaskCreated = true;
      state.error = null;
    },
    deleteTaskFail(state, action) {
      state.error = action.payload;
      state.isTaskCreated = false;
    },
    resetTaskFlag(state) {
      state.isTaskCreated = false;
      state.error = null;
    },
  },
});

export const {
  getTaskListSuccess,
  getTaskListFail,
  addNewTaskSuccess,
  addNewTaskFail,
  updateTaskSuccess,
  updateTaskFail,
  deleteTaskSuccess,
  deleteTaskFail,
  resetTaskFlag,
} = tasksSlice.actions;

export default tasksSlice.reducer;

