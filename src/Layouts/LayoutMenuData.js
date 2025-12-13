import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

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
        if (iscurrentState !== "Tasks") {
            setIsTasks(false);
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
            icon: <FeatherIcon icon="home" className="icon-dual"/>,
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
        //================Users and Customer Management=========================
        {
            id: "usersAndCustomers",
            label: "Users and Customer",
            icon: <FeatherIcon icon="users" className="icon-dual"/>,
            link: "#",
            click: function (e) {
                e.preventDefault();
                setIsApps(!isApps);
                setIscurrentState("Apps");
                updateIconSidebar(e);
            },
            stateVariables: isApps,
            subItems: [
                {
                    id: "customerManagement",
                    label: "Customer Management",
                    icon: <FeatherIcon icon="users" className="icon-dual"/>,
                    link: "/customer-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "userManagement",
                    label: "User Management",
                    icon: <FeatherIcon icon="user" className="icon-dual"/>,
                    link: "/user-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "roleManagement",
                    label: "Role Management",
                    icon: <FeatherIcon icon="shield" className="icon-dual"/>,
                    link: "/role-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "permissionManagement",
                    label: "Permission Management",
                    icon: <FeatherIcon icon="key" className="icon-dual"/>,
                    link: "/permission-management",
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
        {
            label: "Other",
            isHeader: true,
        },
        {
            id: "categoryManagement",
            label: "Category Management",
            icon: <FeatherIcon icon="box" className="icon-dual"/>,
            link: "/category-management",
            click: function (e) {
                e.preventDefault();
                setIsProduct(!isProduct);
                setIscurrentState("Products");
                updateIconSidebar(e);
            },
            stateVariables: isProduct,
        },

        //================Product Management========================
        {
            id: "productManagement",
            label: "Items Management",
            icon: <FeatherIcon icon="grid" className="icon-dual"/>,
            link: "/product-management",
            click: function (e) {
                e.preventDefault();
                setIsProduct(!isProduct);
                setIscurrentState("Products");
                updateIconSidebar(e);
            },
            stateVariables: isProduct,

        },
        //================Product Management========================
        {
            id: "productCostManagement",
            label: "Cost Management",
            icon: <FeatherIcon icon="dollar-sign" className="icon-dual"/>,
            link: "/product-cost-management",
            click: function (e) {
                e.preventDefault();
                setIsProduct(!isProduct);
                setIscurrentState("Products");
                updateIconSidebar(e);
            },
            stateVariables: isProduct,
            subItems: [
                {
                    id: "product-cost-management",
                    label: "Cost Management",
                    icon: <FeatherIcon icon="grid" className="icon-dual"/>,
                    link: "/product-cost-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "product-cost-calculate",
                    label: "Cost Calculator",
                    icon: <FeatherIcon icon="calculator" className="icon-dual"/>,
                    link: "/product-cost-calculate",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "costing-management",
                    label: "Costing Management",
                    icon: <FeatherIcon icon="file-text" className="icon-dual"/>,
                    link: "/costing-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
                {
                    id: "costed-products",
                    label: "Costed Products",
                    icon: <FeatherIcon icon="package" className="icon-dual"/>,
                    link: "/costed-products",
                    click: function (e) {
                        e.preventDefault();
                        setIsApps(!isApps);
                        setIscurrentState("Apps");
                        updateIconSidebar(e);
                    },
                    stateVariables: isApps,
                },
            ]
        },
        //================Suppliers Management========================
        {
            id: "suppliersManagement",
            label: "Suppliers Management",
            icon: <FeatherIcon icon="truck" className="icon-dual"/>,
            link: "/suppliers-management",
            click: function (e) {
                e.preventDefault();
                setIsProduct(!isProduct);
                setIscurrentState("Products");
                updateIconSidebar(e);
            },
            stateVariables: isProduct,

        },  //================Suppliers Management========================
        {
            id: "ComplaintManagement",
            label: "Complaint Management",
            icon: <FeatherIcon icon="phone-incoming" className="icon-dual"/>,
            link: "/complaint-management",
            click: function (e) {
                e.preventDefault();
                setIsProduct(!isProduct);
                setIscurrentState("ComplaintManagement");
                updateIconSidebar(e);
            },
            stateVariables: isProduct,

        },
        {
            label: "Task Management",
            isHeader: true,
        },
        {
            id: "taskManagement",
            label: "Task Management",
            icon: <FeatherIcon icon="check-square" className="icon-dual"/>,
            link: "/task-management",
            click: function (e) {
                e.preventDefault();
                setIsTasks(!isTasks);
                setIscurrentState("Tasks");
                updateIconSidebar(e);
            },
            stateVariables: isTasks,
            subItems: [
                {
                    id: "taskList",
                    label: "Task List",
                    icon: <FeatherIcon icon="list" className="icon-dual"/>,
                    link: "/task-management",
                    click: function (e) {
                        e.preventDefault();
                        setIsTasks(!isTasks);
                        setIscurrentState("Tasks");
                        updateIconSidebar(e);
                    },
                    stateVariables: isTasks,
                },
                {
                    id: "taskDetails",
                    label: "Task Details",
                    icon: <FeatherIcon icon="file-text" className="icon-dual"/>,
                    link: "/task-details",
                    click: function (e) {
                        e.preventDefault();
                        setIsTasks(!isTasks);
                        setIscurrentState("Tasks");
                        updateIconSidebar(e);
                    },
                    stateVariables: isTasks,
                },
                {
                    id: "kanbanBoard",
                    label: "Kanban Board",
                    icon: <FeatherIcon icon="layout" className="icon-dual"/>,
                    link: "/kanban-board",
                    click: function (e) {
                        e.preventDefault();
                        setIsTasks(!isTasks);
                        setIscurrentState("Tasks");
                        updateIconSidebar(e);
                    },
                    stateVariables: isTasks,
                },
            ],
        },


    ];
    return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
