import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import classnames from "classnames";
import Select from "react-select";
import { getAllPayments } from "../../service/paymentService";

import {
    Card,
    Container,
    Row,
    Col,
    CardBody,
    CardHeader,
    Nav,
    NavItem,
    NavLink,
    Label,
    Input,
    Button,
} from "reactstrap";

import {
    handleError,
    popUploader,
} from "../../common/commonFunctions";

import { DatePicker, Table, Pagination } from "antd";
import debounce from "lodash/debounce";

export default function PaymentManagement() {
    document.title = "Payment | Address";

    const history = useNavigate();
    const dispatch = useDispatch();

    const [activeTab, setActiveTab] = useState("1");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
    /* const [paymentList, setPaymentList] = useState([]); */

    const [searchOrderId, setSearchOrderId] = useState("");
    const [searchTrackingID, setSearchTrackingID] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [searchCustomerName, setSearchCustomerName] = useState("");
    const [searchOrderDateRange, setSearchOrderDateRange] = useState("");
    const [searchPaymentDateRange, setSearchPaymentDateRange] = useState("");
    const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
    const [orderStatusList, setOrderStatusList] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [paymentMethodList, setPaymentMethodList] = useState([]);
    const [selectedOrderPayment, setSelectedOrderPayment] = useState("");
    const [isOpenMrkPaymentModal, setIsOpenMrkPaymentModal] = useState(false);

    const PaymentTableColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Order ID',
            dataIndex: ['order', 'id'],
            key: 'orderId',
        },
        {
            title: 'Order Code',
            dataIndex: ['order', 'orderCode'],
            key: 'orderCode',
        },
        {
            title: 'Order Status',
            dataIndex: ['order', 'status'],
            key: 'orderStatus',
        },
        {
            title: 'Tracking Code',
            dataIndex: ['order', 'trackingCode'],
            key: 'trackingCode',
        },
        {
            title: 'Net Total',
            dataIndex: ['order', 'netTotal'],
            key: 'netTotal',
        },
        {
            title: 'Shipping Fee',
            dataIndex: ['order', 'shippingFee'],
            key: 'shippingFee',
        },
        {
            title: 'Sub Total',
            dataIndex: ['order', 'subTotal'],
            key: 'subTotal',
        },
        {
            title: 'Discount Amount',
            dataIndex: ['order', 'discountAmount'],
            key: 'discountAmount',
        },
        {
            title: 'Order Created At',
            dataIndex: ['order', 'createdAt'],
            key: 'orderCreatedAt',
        },
    ];

    const paymentList = [
        {
            id: '03b0af35-98c1-454e-9ffa-bc1c3517059c',
            status: 'SUCCESS',
            createdAt: '2024-07-08T08:59:25.925Z',
            order: {
                id: 'ee0c3c7d-b52a-4ec1-b7c9-d38113a5aebd',
                orderCode: 'ORD-13189712',
                status: 'PENDING',
                trackingCode: null,
                netTotal: 1750,
                shippingFee: 200,
                subTotal: 1500,
                discountAmount: null,
                createdAt: '2024-07-08T08:59:25.925Z',
            },
        },
    ];


    //-------------------------- pagination --------------------------

    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecodes, setTotalRecodes] = useState(0);

    const { RangePicker } = DatePicker;

    useEffect(() => {
        loadAllPayments(currentPage);
        /* getPaymentsByPage(pageNumber);
        loadAllOrderStatus(); */
    }, []);

    const toggleTab = (tab, type) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            history("/payment-management");
            setSelectedPaymentStatus(type);
            setSearchOrderId("");
            setSearchCustomerName("");
            setSearchOrderDateRange("");
            setSearchPaymentDateRange("");
            setSelectedOrderStatus("");
            debounceHandleSearchPaymentFiltration(
                searchOrderId,
                searchCustomerName,
                searchOrderDateRange,
                searchPaymentDateRange,
                selectedOrderStatus,
                type,
                selectedPaymentMethod,
                1
            );
        }
    };

    const loadAllPayments = (currentPage) => {
        let temp = [];
        clearFiltrationFields();
        popUploader(dispatch, true);
        getAllPayments(currentPage)
            .then((resp) => {
                console.log(resp.data);
                resp?.data?.records.map((ord, index) => {
                    temp.push({
                        orderId: ord?.orderId,
                        customerName:
                            ord?.orderCustomer?.firstName +
                            " " +
                            ord?.orderCustomer?.lastName,
                        orderDate: moment(ord?.createdAt).format("YYYY-MM-DD"),
                        orderStatus: ord?.orderStatus,
                        amount: parseFloat(ord?.total).toFixed(2),
                        paymentDate:
                            ord?.payment.length > 0
                                ? moment(ord?.createdAt).format("YYYY-MM-DD")
                                : "empty",
                        paymentMethod: ord?.paymentMethod?.code,
                        paymentStatus:
                            ord?.payment.length > 0 ? ord?.payment[0].status : "PENDING",

                        action: (
                            <>
                                {ord?.paymentMethod?.code === "COD" ? (
                                    ord?.payment.length === 0 ||
                                        (ord?.payment.length > 0 &&
                                            ord?.payment[0].status === "PENDING") ? (
                                        checkPermission(CREATE_PAYMENTS) && (
                                            <Button
                                                color="warning"
                                                outline
                                                className="m-2"
                                                onClick={() => {
                                                    toggleMarkPaymentModal(ord);
                                                }}
                                            >
                                                Mark Payment
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            color="primary"
                                            outline
                                            className="m-2"
                                            onClick={() => {
                                                toggleMarkPaymentModal(ord);
                                            }}
                                        >
                                            View
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        color="primary"
                                        outline
                                        className="m-2"
                                        onClick={() => {
                                            toggleMarkPaymentModal(ord);
                                        }}
                                    >
                                        View
                                    </Button>
                                )}
                            </>
                        ),
                    });
                });
                setPaymentList(temp);
                setCurrentPage(resp?.data?.currentPage);
                setTotalRecodes(resp?.data?.totalRecords);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                popUploader(dispatch, false);
                handleError(err);
            })
            .finally();
    };


    const loadAllOrderStatus = () => {
        setOrderStatusList([]);
        let temp = [];
        // popUploader(dispatch, true);
        /* getAllOrderStatus()
            .then((resp) => {
                let temp = [];
                for (let key in resp?.data) {
                    temp.push({ value: key, label: resp?.data[key] });
                }
                setOrderStatusList(temp);
                popUploader(dispatch, false);
            })
            .catch((err) => {
                popUploader(dispatch, false);
                handleError(err);
            })
            .finally(); */
    };


    const handleSearchPaymentFiltration = (
        orderId,
        CusName,
        OrderDateRange,
        PaymentDateRange,
        orderStatus,
        paymentStatus,
        paymentMethod,
        currentPage
    ) => {
        if (
            !orderId &&
            !CusName &&
            (OrderDateRange === undefined ||
                OrderDateRange === null ||
                OrderDateRange === "") &&
            (PaymentDateRange === undefined ||
                PaymentDateRange === null ||
                PaymentDateRange === "") &&
            (orderStatus === undefined ||
                orderStatus === null ||
                orderStatus === "") &&
            (paymentStatus === undefined ||
                paymentStatus === null ||
                paymentStatus === "") &&
            (paymentMethod === undefined ||
                paymentMethod === null ||
                paymentMethod === "")
        ) {
            loadAllPayments(currentPage);
        } else {
            let orderStartDate = ""; // Default to empty string
            let orderEndDate = ""; // Default to empty string
            let paymentStartDate = ""; // Default to empty string
            let paymentEndDate = ""; // Default to empty string

            if (OrderDateRange && OrderDateRange.length === 2) {
                // Check if OrderDateRange is not null and has two elements
                orderStartDate = moment(OrderDateRange[0]).format("YYYY-MM-DD");
                orderEndDate = moment(OrderDateRange[1]).format("YYYY-MM-DD");
            }

            if (PaymentDateRange && PaymentDateRange.length === 2) {
                // Check if PaymentDateRange is not null and has two elements
                paymentStartDate = moment(PaymentDateRange[0]).format("YYYY-MM-DD");
                paymentEndDate = moment(PaymentDateRange[1]).format("YYYY-MM-DD");
            }

            setPaymentList([]);
            let data = {
                orderId: orderId,
                cusName: CusName,
                orderStartDate: orderStartDate,
                orderEndDate: orderEndDate,
                paymentStartDate: paymentStartDate,
                paymentEndDate: paymentEndDate,
                orderStatus:
                    orderStatus === undefined
                        ? ""
                        : orderStatus === null
                            ? ""
                            : orderStatus,
                paymentStatus:
                    paymentStatus === undefined
                        ? ""
                        : paymentStatus === null
                            ? ""
                            : paymentStatus,
                paymentMethod:
                    paymentMethod === undefined
                        ? ""
                        : paymentMethod === null
                            ? ""
                            : paymentMethod,
            };

            let temp = [];
            // popUploader(dispatch, true);
            /*  searchPaymentFiltrationInOrders(data, currentPage)
                 .then((resp) => {
                     resp?.data?.records.map((ord, index) => {
                         temp.push({
                             orderId: ord?.orderId,
                             customerName:
                                 ord?.orderCustomer?.firstName +
                                 " " +
                                 ord?.orderCustomer?.lastName,
                             orderDate: moment(ord?.createdAt).format("YYYY-MM-DD"),
                             orderStatus: ord?.orderStatus,
                             amount: parseFloat(ord?.total).toFixed(2),
                             paymentDate:
                                 ord?.payment.length > 0
                                     ? moment(ord?.createdAt).format("YYYY-MM-DD")
                                     : "empty",
                             paymentMethod: ord?.paymentMethod?.code,
                             paymentStatus:
                                 ord?.payment.length > 0 ? ord?.payment[0].status : "PENDING",
 
                             action: (
                                 <>
                                     {ord?.paymentMethod?.code === "COD" ? (
                                         ord?.payment.length === 0 ||
                                             (ord?.payment.length > 0 &&
                                                 ord?.payment[0].status === "PENDING") ? (
                                             checkPermission(CREATE_PAYMENTS) && (
                                                 <Button
                                                     color="warning"
                                                     outline
                                                     className="m-2"
                                                     onClick={() => {
                                                         toggleMarkPaymentModal(ord);
                                                     }}
                                                 >
                                                     Mark Payment
                                                 </Button>
                                             )
                                         ) : (
                                             <Button
                                                 color="primary"
                                                 outline
                                                 className="m-2"
                                                 onClick={() => {
                                                     toggleMarkPaymentModal(ord);
                                                 }}
                                             >
                                                 View
                                             </Button>
                                         )
                                     ) : (
                                         <Button
                                             color="primary"
                                             outline
                                             className="m-2"
                                             onClick={() => {
                                                 toggleMarkPaymentModal(ord);
                                             }}
                                         >
                                             View
                                         </Button>
                                     )}
                                 </>
                             ),
                         });
                     });
                     setPaymentList(temp);
                     setCurrentPage(resp?.data?.currentPage);
                     setTotalRecodes(resp?.data?.totalRecords);
                    popUploader(dispatch, false);
                 })
                 .catch((err) => {
                     handleError(err);
                    popUploader(dispatch, false);
                 })
                 .finally(); */
        }
    };

    const debounceHandleSearchPaymentFiltration = React.useCallback(
        debounce(handleSearchPaymentFiltration, 500),
        []
    );

    const handleChangeOrderStatus = (e) => {
        let status = e?.label;

        debounceHandleSearchPaymentFiltration(
            searchOrderId,
            searchCustomerName,
            searchOrderDateRange,
            searchPaymentDateRange,
            status === undefined ? "" : status,
            selectedPaymentStatus,
            selectedPaymentMethod,
            1
        );
        setSelectedOrderStatus(status);
    };

    const handleChangePaymentMethod = (e) => {
        let method = e?.value;

        debounceHandleSearchPaymentFiltration(
            searchOrderId,
            searchCustomerName,
            searchOrderDateRange,
            searchPaymentDateRange,
            selectedOrderStatus,
            selectedPaymentStatus,
            method === undefined ? "" : method,
            1
        );
        setSelectedPaymentMethod(method);
    };

    const onChangePagination = (page) => {
        setCurrentPage(page);

        if (
            !searchOrderId &&
            !searchCustomerName &&
            (searchOrderDateRange === undefined ||
                searchOrderDateRange === null ||
                searchOrderDateRange === "") &&
            (searchPaymentDateRange === undefined ||
                searchPaymentDateRange === null ||
                searchPaymentDateRange === "") &&
            (selectedOrderStatus === undefined ||
                selectedOrderStatus === null ||
                selectedOrderStatus === "") &&
            (selectedPaymentStatus === undefined ||
                selectedPaymentStatus === null ||
                selectedPaymentStatus === "")
        ) {
            loadAllPayments(page);
        } else {
            debounceHandleSearchPaymentFiltration(
                searchOrderId,
                searchCustomerName,
                searchOrderDateRange,
                searchPaymentDateRange,
                selectedOrderStatus,
                selectedPaymentStatus,
                selectedPaymentMethod,
                page
            );
        }
    };

    const clearFiltrationFields = () => {
        setActiveTab("1");
        setSelectedPaymentStatus("");
        setSearchOrderId("");
        setSearchCustomerName("");
        setSearchOrderDateRange("");
        setSearchPaymentDateRange("");
        setSelectedOrderStatus("");
    };

    return (
        <>
            <div className="page-content">
                <Container fluid>
                    <div className="row mt-3">
                        <h4>Payment Management</h4>
                    </div>
                    <Card id="paymentList">
                        <CardHeader className="card-header border-0">
                            <Row className="align-items-center gy-3">
                                <div className="col-sm">
                                    <h5 className="card-title mb-0">Payment History</h5>
                                </div>
                            </Row>
                        </CardHeader>

                        <CardBody className="pt-0">
                            <div>
                                <Nav
                                    className="nav-tabs nav-tabs-custom nav-primary"
                                    role="tablist"
                                >
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "1" })}
                                            onClick={() => {
                                                toggleTab("1", "");
                                            }}
                                            href="#"
                                        >
                                            <i className="ri-apps-fill me-1 align-bottom"></i>
                                            All Payments
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "2" })}
                                            onClick={() => {
                                                toggleTab("2", "PENDING");
                                            }}
                                            href="#"
                                        >
                                            <i className="ri-checkbox-circle-fill me-1 align-bottom"></i>
                                            Success
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "3" })}
                                            onClick={() => {
                                                toggleTab("3", "PAID");
                                            }}
                                            href="#"
                                        >
                                            <i className="ri-close-circle-fill me-1 align-bottom"></i>
                                            Cancelled
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "3" })}
                                            onClick={() => {
                                                toggleTab("3", "PAID");
                                            }}
                                            href="#"
                                        >
                                            <i className="ri-refund-fill me-1 align-bottom"></i>
                                            Refund
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink
                                            className={classnames({ active: activeTab === "4" })}
                                            onClick={() => {
                                                toggleTab("4", "FAIL");
                                            }}
                                            href="#"
                                        >
                                            <i className="ri-error-warning-fill me-1 align-bottom"></i>
                                            Fail
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <Row className="mt-3">
                                    <Col sm={12} md={6} lg={3} className="mb-3">
                                        <Label>Search By Order ID</Label>
                                        <Input
                                            placeholder="Search order by order ID"
                                            value={searchOrderId}
                                            onChange={(e) => {
                                                debounceHandleSearchPaymentFiltration(
                                                    e.target.value,
                                                    searchCustomerName,
                                                    searchOrderDateRange,
                                                    searchPaymentDateRange,
                                                    selectedOrderStatus,
                                                    selectedPaymentStatus,
                                                    selectedPaymentMethod,
                                                    1
                                                );
                                                setSearchOrderId(e.target.value);
                                            }}
                                        />
                                    </Col>
                                    <Col sm={12} md={6} lg={3}>
                                        <Label>Search By Customer Name</Label>
                                        <Input
                                            placeholder="Search order by customer name"
                                            value={searchCustomerName}
                                            onChange={(e) => {
                                                debounceHandleSearchPaymentFiltration(
                                                    searchOrderId,
                                                    e.target.value,
                                                    searchOrderDateRange,
                                                    searchPaymentDateRange,
                                                    selectedOrderStatus,
                                                    selectedPaymentStatus,
                                                    selectedPaymentMethod,
                                                    1
                                                );
                                                setSearchCustomerName(e.target.value);
                                            }}
                                        />
                                    </Col>

                                    <Col sm={12} md={6} lg={3}>
                                        <Label>Search By Customer Email</Label>
                                        <Input
                                            placeholder="Search order by email"
                                            value={searchEmail}
                                            onChange={(e) => { }}
                                        />
                                    </Col>

                                    <Col sm={12} md={6} lg={3}>
                                        <Label>Search By Tracking ID</Label>
                                        <Input
                                            placeholder="Search order by tracking ID"
                                            value={searchTrackingID}
                                            onChange={(e) => { }}
                                        />
                                    </Col>

                                    <Col sm={12} md={6} lg={3}>
                                        <Label>Search By Order Date Range</Label>
                                        <RangePicker
                                            style={{ height: 40, width: "100%", borderRadius: 4 }}
                                            onChange={(selectedDates) => {
                                                if (selectedDates) {
                                                    const formattedDates = selectedDates.map((date) =>
                                                        date ? date.format("YYYY-MM-DD") : null
                                                    );
                                                    debounceHandleSearchPaymentFiltration(
                                                        searchOrderId,
                                                        searchCustomerName,
                                                        formattedDates,
                                                        searchPaymentDateRange,
                                                        selectedOrderStatus,
                                                        selectedPaymentStatus,
                                                        selectedPaymentMethod,
                                                        1
                                                    );
                                                    setSearchOrderDateRange(formattedDates);
                                                } else {
                                                    setSearchOrderDateRange("");
                                                    debounceHandleSearchPaymentFiltration(
                                                        searchOrderId,
                                                        searchCustomerName,
                                                        "",
                                                        searchPaymentDateRange,
                                                        selectedOrderStatus,
                                                        selectedPaymentStatus,
                                                        selectedPaymentMethod,
                                                        1
                                                    );
                                                }
                                            }}
                                        />
                                    </Col>

                                    <Col sm={12} md={6} lg={3}>
                                        <Label>Search By Payment Status</Label>
                                        <Select
                                            value={
                                                paymentMethodList.find(
                                                    (option) => option.value === selectedPaymentMethod
                                                ) || null
                                            }
                                            className="basic-single"
                                            classNamePrefix="Search order by payment status"
                                            isSearchable={true}
                                            isClearable
                                            onChange={handleChangePaymentMethod}
                                            options={paymentMethodList}
                                        />
                                    </Col>

                                </Row>

                                <Row>
                                    <Col sm={12} lg={12}>
                                        <Table
                                            className="mx-3 my-4"
                                            pagination={false}
                                            columns={PaymentTableColumns}
                                            dataSource={paymentList}
                                            scroll={{ x: "fit-content" }}
                                        />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        className=" d-flex justify-content-end"
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={12}
                                    >
                                        <Pagination
                                            className="m-3"
                                            current={currentPage}
                                            onChange={onChangePagination}
                                            defaultPageSize={15}
                                            total={totalRecodes}
                                            showSizeChanger={false}
                                            showTotal={(total) => `Total ${total} items`}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </CardBody>
                    </Card>
                </Container>
            </div>
        </>
    )
}
