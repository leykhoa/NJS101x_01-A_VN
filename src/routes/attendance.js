const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
router.post("/start-working", attendanceController.startWorking);
router.post("/end-working", attendanceController.endWorking);
router.get("/on-leave-list", attendanceController.onLeaveList);
router.post("/on-leave", attendanceController.onLeave);

router.get("/", attendanceController.index);

module.exports = router;
