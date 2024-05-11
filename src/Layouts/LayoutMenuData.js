import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

//Import Icons
import FeatherIcon from "feather-icons-react";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isApps, setIsApps] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [isPages, setIsPages] = useState(false);
  const [isBaseUi, setIsBaseUi] = useState(false);
  const [isAdvanceUi, setIsAdvanceUi] = useState(false);
  const [isForms, setIsForms] = useState(false);
  const [isTables, setIsTables] = useState(false);
  const [isCharts, setIsCharts] = useState(false);
  const [isIcons, setIsIcons] = useState(false);
  const [isMaps, setIsMaps] = useState(false);
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [isProduct, setIsProduct] = useState(false);

  // Apps
  const [isEmail, setEmail] = useState(false);
  const [isSubEmail, setSubEmail] = useState(false);
  const [isEcommerce, setIsEcommerce] = useState(false);
  const [isProjects, setIsProjects] = useState(false);
  const [isTasks, setIsTasks] = useState(false);
  const [isCRM, setIsCRM] = useState(false);
  const [isCrypto, setIsCrypto] = useState(false);
  const [isInvoices, setIsInvoices] = useState(false);
  const [isSupportTickets, setIsSupportTickets] = useState(false);
  const [isNFTMarketplace, setIsNFTMarketplace] = useState(false);

  const [isJobs, setIsJobs] = useState(false);
  const [isJobList, setIsJobList] = useState(false);
  const [isCandidateList, setIsCandidateList] = useState(false);

  // Authentication
  const [isSignIn, setIsSignIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isPasswordCreate, setIsPasswordCreate] = useState(false);
  const [isLockScreen, setIsLockScreen] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);
  const [isVerification, setIsVerification] = useState(false);
  const [isError, setIsError] = useState(false);

  // Pages
  const [isProfile, setIsProfile] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  // Charts
  const [isApex, setIsApex] = useState(false);

  // Multi Level
  const [isLevel1, setIsLevel1] = useState(false);
  const [isLevel2, setIsLevel2] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Apps") {
      setIsApps(false);
    }
    if (iscurrentState !== "Auth") {
      setIsAuth(false);
    }
    if (iscurrentState !== "Pages") {
      setIsPages(false);
    }
    if (iscurrentState !== "BaseUi") {
      setIsBaseUi(false);
    }
    if (iscurrentState !== "AdvanceUi") {
      setIsAdvanceUi(false);
    }

    if (iscurrentState !== "Forms") {
      setIsForms(false);
    }
    if (iscurrentState !== "Tables") {
      setIsTables(false);
    }
    if (iscurrentState !== "Charts") {
      setIsCharts(false);
    }
    if (iscurrentState !== "Icons") {
      setIsIcons(false);
    }
    if (iscurrentState !== "Maps") {
      setIsMaps(false);
    }
    if (iscurrentState !== "MuliLevel") {
      setIsMultiLevel(false);
    }
    if (iscurrentState === "Widgets") {
      history("/widgets");
      document.body.classList.add("twocolumn-panel");
    }
    if (iscurrentState === "Landing") {
      setIsLanding(false);
    }
    if (isProduct === "Product") {
      setIsProduct(false);
    }
  }, [
    history,
    iscurrentState,
    isDashboard,
    isApps,
    isAuth,
    isPages,
    isBaseUi,
    isAdvanceUi,
    isForms,
    isTables,
    isCharts,
    isIcons,
    isMaps,
    isMultiLevel,
  ]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "dashboard",
      label: "Dashboards",
      icon: <FeatherIcon icon="home" className="icon-dual" />,
      link: "/dashboard",
      stateVariables: isDashboard,
      click: function (e) {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
    },
    {
      label: "Users",
      isHeader: true,
    },
    //================User Management=========================
    {
      id: "userManagement",
      label: "Users Management",
      icon: <FeatherIcon icon="users" className="icon-dual" />,
      link: "/user-management",
      click: function (e) {
        e.preventDefault();
        setIsApps(!isApps);
        setIscurrentState("Apps");
        updateIconSidebar(e);
      },
      stateVariables: isApps,
      subItems: [
        {
          id: "staffManagement",
          label: "Staff Management",
          icon: <FeatherIcon icon="grid" className="icon-dual" />,
          link: "/staff-management",
          click: function (e) {
            e.preventDefault();
            setIsApps(!isApps);
            setIscurrentState("Apps");
            updateIconSidebar(e);
          },
          stateVariables: isApps,
        },
        {
          id: "customerManagement",
          label: "Customer Management",
          icon: <FeatherIcon icon="users" className="icon-dual" />,
          link: "/customer-management",
          click: function (e) {
            e.preventDefault();
            setIsApps(!isApps);
            setIscurrentState("Apps");
            updateIconSidebar(e);
          },
          stateVariables: isApps,
        },
      ],
    },
    //===============Role And Permissions=========================
    {
      label: "Role and Permission",
      isHeader: true,
    },
    {
      id: "apps",
      label: "Role and Permissions",
      icon: <FeatherIcon icon="shield" className="icon-dual" />,
      link: "/role-permission-management",
      click: function (e) {
        e.preventDefault();
        setIsApps(!isApps);
        setIscurrentState("Apps");
        updateIconSidebar(e);
      },
      stateVariables: isApps,
    },
    {
      label: "Product",
      isHeader: true,
    },

    //================Product Management========================
    {
      id: "productManagement",
      label: "Product Management",
      icon: <FeatherIcon icon="users" className="icon-dual" />,
      link: "/product-management",
      click: function (e) {
        e.preventDefault();
        setIsProduct(!isProduct);
        setIscurrentState("Products");
        updateIconSidebar(e);
      },
      stateVariables: isProduct,
      subItems: [
        {
          id: "exampleManagement",
          label: "Example Management",
          icon: <FeatherIcon icon="grid" className="icon-dual" />,
          link: "/example-management",
          click: function (e) {
            e.preventDefault();
            setIsProduct(!isProduct);
            setIscurrentState("Products");
            updateIconSidebar(e);
          },
          stateVariables: isProduct,
        },
        {
          id: "exampleManagement",
          label: "Example Management",
          icon: <FeatherIcon icon="users" className="icon-dual" />,
          link: "/example-management",
          click: function (e) {
            e.preventDefault();
            setIsProduct(!isProduct);
            setIscurrentState("Products");
            updateIconSidebar(e);
          },
          stateVariables: isProduct,
        },
      ],
    },
    // {
    // id: "authentication",
    // label: "Authentication",
    // icon: <FeatherIcon icon="users" className="icon-dual" />,
    // link: "/pages-coming-soon",
    // click: function (e) {
    //   e.preventDefault();
    //   setIsAuth(!isAuth);
    //   setIscurrentState("Auth");
    //   updateIconSidebar(e);
    // },
    // stateVariables: isAuth,
    // subItems: [
    //     {
    //         id: "signIn",
    //         label: "Sign In",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsSignIn(!isSignIn);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isSignIn,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "signUp",
    //         label: "Sign Up",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsSignUp(!isSignUp);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isSignUp,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "passwordReset",
    //         label: "Password Reset",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsPasswordReset(!isPasswordReset);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isPasswordReset,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "passwordCreate",
    //         label: "Password Create",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsPasswordCreate(!isPasswordCreate);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isPasswordCreate,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "lockScreen",
    //         label: "Lock Screen",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsLockScreen(!isLockScreen);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isLockScreen,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "logout",
    //         label: "Logout",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsLogout(!isLogout);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isLogout,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "successMessage",
    //         label: "Success Message",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsSuccessMessage(!isSuccessMessage);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isSuccessMessage,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "twoStepVerification",
    //         label: "Two Step Verification",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsVerification(!isVerification);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isVerification,
    //         childItems: [
    //             { id: 1, label: "Basic", link: "#" },
    //             { id: 2, label: "Cover", link: "#" },
    //         ]
    //     },
    //     {
    //         id: "errors",
    //         label: "Errors",
    //         link: "/#",
    //         isChildItem: true,
    //         click: function (e) {
    //             e.preventDefault();
    //             setIsError(!isError);
    //         },
    //         parentId: "authentication",
    //         stateVariables: isError,
    //         childItems: [
    //             { id: 1, label: "404 Basic", link: "#" },
    //             { id: 2, label: "404 Cover", link: "#" },
    //             { id: 3, label: "404 Alt", link: "#" },
    //             { id: 4, label: "500", link: "#" },
    //             { id: 5, label: "Offline Page", link: "#" },
    //         ]
    //     },
    // ],
    // },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
