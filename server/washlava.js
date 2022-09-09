const axios = require("axios");
const Log = require("./models/log");

const machines = new Map();
const statusChanges = new Map();

const WASHLAVA_APP_CLIENT_ID = process.env.WASHLAVA_APP_CLIENT_ID;
const WASHLAVA_APP_DEVICE = process.env.WASHLAVA_APP_DEVICE;
const WASHLAVA_USERNAME = process.env.WASHLAVA_USERNAME;
const WASHLAVA_PASSWORD = process.env.WASHLAVA_PASSWORD;
const REQUEST_ITERATION_TIME = process.env.REQUEST_ITERATION_TIME || 300;

let currentAuthToken = undefined;

/**
 * Create new authentication and set server state to use the new token.
 */
async function createNewAuth() {
  // log the auth
  const log = new Log({
    eventType: "auth_start",
  });
  await log.save();

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
  try {
    const response = await axios.post("https://washlava-prod.auth0.com/tokeninfo", {
      id_token: currentAuthToken,
    });
    const data = await response.data;

    // log the auth
    const log = new Log({
      eventType: "auth_check_pass",
    });
    await log.save();
  } catch (e) {
    // log the auth
    const log = new Log({
      eventType: "auth_check_fail",
    });
    await log.save();
    throw e;
  }
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
    if (change === undefined) since = undefined;
    else since = new Date();
    statusChanges.set(id, { status: data.status, since });

    // log the change
    const log = new Log({
      eventType: "machine_status",
      machineId: data.identifier.toString(),
      previousStatus: change?.status,
      newStatus: data.status,
    });

    await log.save();
  } else {
    since = change.since;
  }

  return {
    id: data.identifier.toString(),
    type: data.type,
    location: getLocation(data.identifier),
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
  try {
    const machine = await fetchMachineInfo(id);
    machines.set(machine.id, machine);
  } catch (ex) {
    console.log(`failed to fetch for machine ${id}`);
    console.error(ex);
  }
}

async function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );
}

const dormData = new Map(
  Object.entries({
    baker: {
      name: "Baker House",
      ranges: [[700, 721]], // 22
    },
    mccormick: {
      name: "McCormick",
      ranges: [[778, 796]], // 19
    },
    simmons: {
      name: "Simmons Hall",
      ranges: [[797, 816]], // 20
    },
    next: {
      name: "Next House",
      ranges: [[829, 850]], // 22
    },
    new: {
      name: "New House",
      ranges: [[851, 870]], // 20
    },
    maseeh: {
      name: "Maseeh Hall",
      ranges: [[871, 904]], // 34
    },
    ec: {
      name: "East Campus",
      ranges: [
        [1039, 1062],
        // [1128, 1131],
      ], // 24
    },
    macg: {
      name: "MacGregor House",
      ranges: [[1075, 1106]], // 32
    },
    // bc: {
    //   name: "Burton Conner",
    //   ranges: [[1107, 1127]], // 21
    // },
    nv: {
      name: "New Vassar",
      ranges: [[1132, 1171]], // 40
    },
    site4: {
      name: "Site 4",
      ranges: [[1172, 1235]], // 64
    },
  })
);
const allMachineIds = []; // need to be precomputed

function precompute() {
  for (const [name, data] of dormData) {
    for (const range of data.ranges) {
      const [begin, end] = range;
      for (var i = begin; i <= end; ++i) {
        allMachineIds.push(i);
      }
    }
  }
  console.log(allMachineIds);
}

function getLocation(id) {
  for (const [name, data] of dormData) {
    if (data.ranges.some((range) => range[0] <= id && id <= range[1])) {
      return name;
    }
  }
  return undefined;
}

async function initialize() {
  precompute();

  // log the startup
  const log = new Log({
    eventType: "startup",
  });
  await log.save();

  await createNewAuth();
  setInterval(doMaintainAuthJob, 10 * 60 * 1000);
  for (const id of allMachineIds) {
    machines.set(id, {
      id,
      type: undefined,
      location: getLocation(id),
      status: undefined,
      queryTimestamp: new Date(),
    });
  }
  for (const id of allMachineIds) {
    await delay(500); // a hacky way to not flood everything all at once
    setTimeout(() => doMachineJob(id), 0);
    setInterval(() => doMachineJob(id), REQUEST_ITERATION_TIME * 1000);
  }
  setInterval(() => {
    axios.get("http://laundry.tcpc.me");
  }, 30 * 60 * 1000); // every 20 minutes
}

function getMachines() {
  return new Map(machines);
}

module.exports = { initialize, getMachines };
