import React, { useEffect, useState } from "react";

import api from "../../api";
import utils from "../../utils";
import "../../utilities.css";
import "./Main.css";

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
    <div>
      <h1>Machines!</h1>
      <ul>
        {machines.map((machine) => (
          <li>
            {machine.type} {machine.id}, {machine.location}, {machine.status} since{" "}
            {utils.timeAgo(machine.since)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Main;
