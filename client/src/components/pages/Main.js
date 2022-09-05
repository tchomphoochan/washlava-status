import React, { useEffect, useState } from "react";

import api from "../../api";
import utils from "../../utils";
import "./Main.css";

import Machine from "../modules/Machine";
import { Card } from "semantic-ui-react";

function Main() {
  const [machines, setMachines] = useState([]);

  async function fetchDataAndUpdate() {
    const response = await api.getMachines();
    const data = await response.data;
    const machines = Array.from(Object.values(data.machines));
    console.log(machines);
    setMachines(machines);
  }

  useEffect(() => {
    fetchDataAndUpdate();
    const task = setInterval(() => fetchDataAndUpdate(), 60 * 1000);
    return () => clearInterval(task);
  }, []);

  return (
    <div id="main">
      <h1>Next House</h1>

      <Card.Group stackable={true}>
        {machines.map((machine) => (
          <Machine key={machine.id} machine={machine} />
        ))}
      </Card.Group>
    </div>
  );
}

export default Main;
