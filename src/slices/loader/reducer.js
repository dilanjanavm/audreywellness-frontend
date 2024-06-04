import { IS_LOADER } from "./action";

const initialState = {
    isLoader: false,
    type: 0
};

const loaderReducer = (state = initialState, action) => {
    switch (action.type) {
        case IS_LOADER:
            return {
                ...state,
                isLoader: action.value.isLoader !== undefined ? action.value.isLoader : state.isLoader,
                type: action.value.type !== undefined ? action.value.type : state.type
            };
        default:
            return state;
    }
};

export default loaderReducer;