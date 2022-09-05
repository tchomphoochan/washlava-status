/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");
const asyncHandler = require("express-async-handler");
const washlava = require("./washlava");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

router.get(
  "/machines",
  asyncHandler(async (req, res) => {
    const machines = washlava.getMachines();
    res.send({ machines: Object.fromEntries(machines) });
  })
);

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
