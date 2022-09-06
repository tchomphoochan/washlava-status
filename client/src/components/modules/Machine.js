import React from "react";
import { Card, Label } from "semantic-ui-react";

import utils from "../../utils";

function Availability({ machine }) {
  if (machine.status === "available") {
    return (
      <>
        <Label basic color="green">
          Available
        </Label>
        <div style={{ display: "inline", paddingLeft: "6px" }}>
          🕒 <i>{utils.timeAgo(machine.since)}</i>
        </div>
      </>
    );
  } else if (machine.status === "in_use" || machine.status.includes("reserve")) {
    return (
      <>
        <Label basic color="orange">
          {utils.capitalize(machine.status)}
        </Label>
        <div style={{ display: "inline", paddingLeft: "6px" }}>
          🕒 <i>{utils.timeAgo(machine.since)}</i>
        </div>
      </>
    );
  } else if (machine.status === "in_cycle") {
    return (
      <>
        <Label basic color="red">
          In cycle
        </Label>
        <div style={{ display: "inline", paddingLeft: "6px" }}>
          🕒 <i>{utils.timeAgo(machine.since)}</i>
        </div>
      </>
    );
  } else {
    return (
      <>
        <Label basic color="grey">
          {utils.capitalize(machine.status)}
        </Label>{" "}
        <div style={{ display: "inline", paddingLeft: "6px" }}>
          🕒 <i>{utils.timeAgo(machine.since)}</i>
        </div>
      </>
    );
  }
}

function Machine({ machine }) {
  return (
    <Card>
      <Card.Content>
        <Card.Header>{machine.id}</Card.Header>
        <Card.Meta>{utils.capitalize(machine.type)}</Card.Meta>
        <Card.Description>
          <Availability machine={machine} />
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

export default Machine;
