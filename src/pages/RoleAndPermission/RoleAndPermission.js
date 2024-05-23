import React from "react";
import { Card, Container } from "reactstrap";
import { Tabs } from "antd";
import Permission from "./Permission";
import RoleManagement from "./RoleManagement";

const RoleAndPermission = () => {
  document.title = "Role And Permissions| Address Shop";
  const { TabPane } = Tabs;

  const onChangeeee = (key) => {
    console.log(key);
  };

  const tab = [
    {
      label: "Role Management",
      key: "1",
      children: <RoleManagement />,
    },
    {
      label: "Permission Management",
      key: "2",
      children: <Permission />,
    },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <Tabs onChange={onChangeeee} type="card" className="mt-3">
          {tab.map((item) => (
            <TabPane tab={item.label} key={item.key}>
              <Card className="border-top-0">{item.children}</Card>
            </TabPane>
          ))}
        </Tabs>
      </Container>
    </div>
  );
};

export default RoleAndPermission;
