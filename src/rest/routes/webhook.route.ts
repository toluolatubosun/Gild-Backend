import { Router } from "express";
import WebhookCtrl from "../controllers/webhook.controller";

const router = Router();

router.post("/demo", WebhookCtrl.demo);

router.post("/stripe", WebhookCtrl.stripe);

export default router;
