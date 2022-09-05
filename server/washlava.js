const axios = require("axios");

const machines = new Map();
const statusChanges = new Map();

const WASHLAVA_APP_CLIENT_ID = process.env.WASHLAVA_APP_CLIENT_ID;
const WASHLAVA_APP_DEVICE = process.env.WASHLAVA_APP_DEVICE;
const WASHLAVA_USERNAME = process.env.WASHLAVA_USERNAME;
const WASHLAVA_PASSWORD = process.env.WASHLAVA_PASSWORD;

let currentAuthToken = undefined;

/**
 * Create new authentication and set server state to use the new token.
 */
async function createNewAuth() {
  const response = await axios.post("https://washlava-prod.auth0.com/oauth/ro", {
    grant_type: "password",
    scope: "openid offline_access",
    connection: "Username-Password-Authentication",
    device: WASHLAVA_APP_DEVICE,
    client_id: WASHLAVA_APP_CLIENT_ID,
    username: WASHLAVA_USERNAME,
    password: WASHLAVA_PASSWORD,
  });
  const data = await response.data;
  currentAuthToken = data.id_token;
}

/**
 * @throws An error if fail to confirm current authentication.
 */
async function confirmAuthStatus() {
  const response = await axios.post("https://washlava-prod.auth0.com/tokeninfo", {
    id_token: currentAuthToken,
  });
  const data = await response.data;
}

/**
 * @throws An error if not authenticated.
 */
async function fetchMachineInfo(id) {
  if (currentAuthToken === undefined) throw new Error("not authenticated");
  const url = `https://api.washlava.com/api/v3/machines/${id}`;
  const response = await axios.get(url, {
    headers: { authorization: "Bearer " + currentAuthToken },
  });
  const data = await response.data;

  // keep track of when this status was last changed
  const change = statusChanges.get(id);
  let since;
  if (change === undefined || change.status !== data.status) {
    since = new Date();
    statusChanges.set(id, { status: data.status, since: new Date() });
  } else {
    since = change.since;
  }

  return {
    id: data.identifier,
    type: data.type,
    location: data.store.street.split(",")[0],
    status: data.status,
    since,
    queryTimestamp: new Date(),
  };
}

async function doMaintainAuthJob() {
  console.log(`starting maintain auth job`);
  try {
    await confirmAuthStatus();
  } catch (ex) {
    console.log(`creating new authentication`);
    await createNewAuth();
    await confirmAuthStatus();
  }
}

async function doMachineJob(id) {
  console.log(`starting machine job ${id}`);
  try {
    const machine = await fetchMachineInfo(id);
    machines.set(machine.id, machine);
    console.log(`successfully fetched machine ${id}`);
  } catch (ex) {
    console.log(`failed to fetch for machine ${id}`);
    console.error(ex);
  }
}

const MACHINE_ID_START = 829;
const MACHINE_ID_END = 850;

async function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
}

async function initialize() {
  await createNewAuth();
  setTimeout(doMaintainAuthJob, 300 * 1000);
  for (let id = MACHINE_ID_START; id <= MACHINE_ID_END; ++id) {
    machines.set(id, {
      id,
      type: undefined,
      location: undefined,
      status: undefined,
      queryTimestamp: new Date(),
    });
  }
  for (let id = MACHINE_ID_START; id <= MACHINE_ID_END; ++id) {
    await delay(500); // a hacky way to not flood everything all at once
    setTimeout(() => doMachineJob(id), 0);
    setInterval(() => doMachineJob(id), 60 * 1000);
  }
  setInterval(() => {
    axios.get("http://laundry.tcpc.me");
  }, 20 * 60 * 1000); // every 20 minutes
}

function getMachines() {
  return new Map(machines);
}

module.exports = { initialize, getMachines };
