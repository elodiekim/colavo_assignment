import { getTimeSlotsController } from "../controllers/controller";
import express, { Router } from "express";

const router: Router = express.Router();
router.post("/getTimeSlots", getTimeSlotsController);

export default router;
