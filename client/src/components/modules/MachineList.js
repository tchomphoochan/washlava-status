import React from "react";
import { Card, Header } from "semantic-ui-react";

import Machine from "../modules/Machine";

function MachineList({ machines }) {
  if (machines.length === 0) {
    return (
      <div style={{ textAlign: "center", margin: "20px" }}>
        <i>(empty)</i>
      </div>
    );
  } else {
    return (
      <Card.Group centered stackable>
        {machines.map((machine) => (
          <Machine key={machine.id} machine={machine} />
        ))}
      </Card.Group>
    );
  }
}

export default MachineList;
