import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Label,
  Input,
  FormGroup,
  Button,
} from "reactstrap";
import { Table, Tag } from "antd";
import { Plus } from "react-feather";
import { CustomerTableColumns } from "../../common/tableColumns";
import * as customerService from "../../service/customerService";
import { useDispatch } from "react-redux";
import {
  sweetAlertConformation,
  customToastMsg,
  handleError,
  popUploader,
} from "../../common/commonFunctions";
const CustomerManagement = () => {
  document.title = "Customers | Address Shop";

  const [memberTableList, setMemberTableList] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [searchContactNo, setSearchContactNo] = useState("");
  const [searchName, setSearchName] = useState("");
  let dispatch = useDispatch();

  useEffect(() => {
    loadAllCustomers();
  }, []);

  const loadAllCustomers = () => {
    popUploader(dispatch, true);

    customerService
      .getAll()
      .then((res) => {
        popUploader(dispatch, false);

        console.log(res, "custromers");
        const formattedData = res.data.map((record) => {
          // let actionText = record.status === 1 ? "Terminate" : "Activate";
          let actionText =
            record.user.status === 1
              ? "Terminate"
              : record.user.status === 2
              ? "Activate"
              : "Unknown";
          return {
            name: record.user.firstName + " " + record.user.lastName,
            contactNo:
              record.user.customer.dialCode +
              " " +
              record.user.customer.contactNo,
            // address: record.address,
            email: record.user.email,
            status: record.user.status,
            action: (
              <>
                <Button
                  style={{ width: "100px" }}
                  color={record.user.status === 1 ? "danger" : "success"}
                  className="m-2"
                  outline
                  onClick={(e) => {
                    if (record.user.status === 1) {
                      handleTerminateAction(record);
                    } else if (record.user.status === 2) {
                      handleActivateAction(record);
                    }
                  }}
                >
                  <span>{actionText}</span>
                </Button>
              </>
            ),
          };
        });
        // formattedData.sort((a, b) => a.name.localeCompare(b.name));
        setMemberTableList(formattedData);
      })
      .catch((err) => {
        popUploader(dispatch, false);
        handleError(err);
      });
  };

  const handleActivateAction = (data) => {
    // const updatedData = {
    //   ...data,
    //   user: {
    //     ...data.user,
    //     status: 1,
    //   },
    // };
    // sweetAlertConformation("Are you sure to activate this member ?", 3, () => {
    //  popUploader(dispatch, true);
    //   memberService
    //     .update(data.id, updatedData)
    //     .then(async (res) => {
    //       console.log(res);
    //       await loadAllMembers();
    //       popUploader(dispatch, false);
    //       customToastMsg("member has been activate", 1);
    //     })
    //     .catch(async (err) => {
    //       await loadAllMembers();
    //       popUploader(dispatch, false);
    //       handleError(err);
    //       console.log(err);
    //     })
    //     .finally();
    // });
  };

  const handleTerminateAction = (data) => {
    // console.log(data);
    // const updatedData = {
    //   ...data,
    //   user: {
    //     ...data.user,
    //     status: 2,
    //   },
    // };
    // sweetAlertConformation("Are you sure to terminate this member ?", 0, () => {
    //  popUploader(dispatch, true);
    //   memberService
    //     .update(data.id, updatedData)
    //     .then(async (res) => {
    //       console.log(res);
    //       await loadAllMembers();
    //       popUploader(dispatch, false);
    //       customToastMsg("member has been terminated", 1);
    //     })
    //     .catch(async (err) => {
    //       await loadAllMembers();
    //       popUploader(dispatch, false);
    //       handleError(err);
    //       console.log(err);
    //     })
    //     .finally();
    // });
  };

  const handleSearchContactNo = (e) => {
    setSearchContactNo(e.target.value);
    // If search input is empty, load all members
    if (e.target.value === "") {
      loadAllCustomers();
    } else {
      // Otherwise, filter members based on the search input
      const filteredMembers = memberTableList.filter((member) =>
        member.contactNo.includes(e.target.value)
      );
      setMemberTableList(filteredMembers);
    }
  };
  const handleSearchName = (e) => {
    setSearchName(e.target.value);
    if (e.target.value === "") {
      loadAllCustomers();
    } else {
      const filteredMembers = memberTableList.filter((member) =>
        member.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setMemberTableList(filteredMembers);
    }
  };

  const toggleModal = (val) => {
    if (val !== undefined) {
      setSelectedUser(val);
      // loadAllMembers();
    } else {
      // loadAllMembers();
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row mt-3">
          <h4>Customer Management</h4>
        </div>
        <Card>
          <Row className="mt-5 mx-2">
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="username">Search by Name</Label>
                <Input
                  id="username"
                  name="name"
                  placeholder="Search by name"
                  type="text"
                  value={searchName}
                  onChange={handleSearchName}
                />
              </FormGroup>
            </Col>
            <Col sm={12} md={6} lg={3} xl={3}>
              <FormGroup>
                <Label for="contactNo">Search by Contact No</Label>
                <Input
                  id="contactNo"
                  name="contactNo"
                  placeholder="Search by contact no"
                  type="text"
                  value={searchContactNo}
                  onChange={handleSearchContactNo}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12} xl={12}>
              <Table
                className="mx-3 my-4"
                pagination={false}
                columns={CustomerTableColumns}
                dataSource={memberTableList}
                scroll={{ x: "fit-content" }}
              />
            </Col>
          </Row>
        </Card>
      </Container>
    </div>
  );
};

export default CustomerManagement;
