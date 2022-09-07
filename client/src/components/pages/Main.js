import React, { useEffect, useState } from "react";

import api from "../../api";
import utils from "../../utils";
import "./Main.css";

import MachineList from "../modules/MachineList";
import { Dropdown, Header, Button } from "semantic-ui-react";

function Main() {
  const [machines, setMachines] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("next");
  const [machineType, setMachineType] = useState("washer");

  function updateLocation(name) {
    setCurrentLocation(name);
    localStorage.setItem("location", name);
    fetchDataAndUpdate();
  }

  async function fetchDataAndUpdate() {
    const response = await api.getMachines();
    const data = await response.data;
    const machines = Array.from(Object.values(data.machines));
    machines.forEach((machine) => {
      if (machine.since) machine.since = new Date(machine.since);
      if (machine.queryTimestamp) machine.queryTimestamp = new Date(machine.queryTimestamp);
    });
    setMachines(machines);
  }

  useEffect(() => {
    const oldLocation = localStorage.getItem("location");
    if (oldLocation) updateLocation(oldLocation);

    fetchDataAndUpdate();
    const task = setInterval(() => fetchDataAndUpdate(), 60 * 1000);
    return () => clearInterval(task);
  }, []);

  const locations = utils.getLocations();
  const locationOptions = locations.map((location) => {
    return { key: location, value: location, text: utils.getFullDormName(location) };
  });
  if (currentLocation === "" && locations.length > 0) updateLocation(locations[0]);

  const dormMachines = machines
    .filter((machine) => machine.location === currentLocation)
    .filter((machine) => machineType === "both" || machine.type === machineType);

  function compareFn(a, b) {
    if (a.since === undefined && b.since === undefined) return 0;
    if (a.since === undefined) return 1;
    if (b.since === undefined) return -1;
    return a.since - b.since;
  }

  const available = dormMachines.filter((machine) => machine.status === "available");
  available.sort(compareFn);
  const unavailable = dormMachines.filter((machine) => machine.status !== "available");
  unavailable.sort(compareFn);

  return (
    <div id="main">
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ marginRight: "40px", marginBottom: "40px" }}>
          <Header as="h2" style={{ marginBottom: "30px" }}>
            MIT Laundry Status
          </Header>
          <div>
            <Header sub>Location</Header>
            <Dropdown
              placeholder="Select location"
              selection
              options={locationOptions}
              value={currentLocation}
              onChange={(e, { value }) => {
                updateLocation(value);
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <Header sub>Machine type</Header>
            <Button.Group onClick={(e) => setMachineType(e.target.value)}>
              <Button value="washer" active={machineType === "washer"}>
                Washer
              </Button>
              <Button value="dryer" active={machineType === "dryer"}>
                Dryer
              </Button>
              <Button value="both" active={machineType === "both"}>
                Both
              </Button>
            </Button.Group>
          </div>

          <div style={{ marginTop: "20px" }}>
            <p>
              <i>Data is updated about every 5 minutes.</i>
            </p>
          </div>
        </div>

        <div style={{ flexBasis: 0, flexGrow: 999, minInlineSize: "70%" }}>
          <Header as="h2">{utils.getFullDormName(currentLocation)}</Header>

          <Header as="h3">
            Available machines
            <Header.Subheader>
              Sorted by least recently active machines first, so you know whose clothes to throw
              out. You're welcome.
            </Header.Subheader>
          </Header>
          <MachineList machines={available} />

          <Header as="h3">
            Unavailable machines
            <Header.Subheader>
              In case everyone happens to be doing laundry on a Sunday night.
            </Header.Subheader>
          </Header>

          <MachineList machines={unavailable} />
        </div>
      </div>

      <div id="footer" style={{ textAlign: "center", marginTop: "50px", color: "grey" }}>
        Made with 💔 for Washlava by <a href="mailto:tcpc@mit.edu">tcpc</a>. <br />
        Found issues? Want to help? <a href="mailto:tcpc@mit.edu">Email me</a> or{" "}
        <a href="https://github.com/aquablitz11/washlava-status">contribute on Github</a>.
      </div>
    </div>
  );
}

export default Main;
