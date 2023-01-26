import response from "../../utils/rest/response";
import WebhookService from "../../services/webhook.service";

import type { Request, Response } from "express";

class WebhookController {
    async demo(req: Request, res: Response) {
        const result = await WebhookService.demo();
        res.status(200).send(response("Demo Webhook fulfilled", result));
    }

    async stripe(req: Request, res: Response) {
        const result = await WebhookService.stripe(req.body, req.headers);
        res.status(200).json({ received: result });
    }
}

export default new WebhookController();
