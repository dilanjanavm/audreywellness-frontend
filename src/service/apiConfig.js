const URL_REMOTE = process.env.REACT_APP_API_URL || "http://206.189.82.117:3003";

const userType = "ADMIN";

// const conf = {
//     serverUrl: "http://localhost:3003",
//     basePath: `public`,
//     redirect: "http://localhost:3003",
//     userType: userType,
// };


const conf = {
    serverUrl: URL_REMOTE,
    basePath: `public`,
    redirect: URL_REMOTE,
    userType: userType,
};

export default conf;
