export const IS_LOADER = "IS_LOADER";

export const loaderHandler = (data) => {
    return {
        type: IS_LOADER,
        value: data  // Make sure 'data' is an object with 'isLoader' and 'type' properties
    };
};