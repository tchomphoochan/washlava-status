import React from "react";
import { Card, Label } from "semantic-ui-react";

import utils from "../../utils";

function Availability({ machine }) {
  const colors = new Map([
    ["available", "green"],
    ["in_use", "orange"],
    ["reserved", "orange"],
    ["in_cycle", "red"],
  ]);

  var color = colors.get(machine.status);
  if (color === undefined) {
    color = "grey";
  }

  return (
    <>
      <Label basic color={color}>
        {utils.capitalize(machine.status)}
      </Label>
      <div style={{ display: "inline", paddingLeft: "6px" }}>
        ⏱️{" "}
        <i>{machine.since !== undefined ? "since " + utils.timeAgo(machine.since) : "unknown"}</i>
      </div>
    </>
  );
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
