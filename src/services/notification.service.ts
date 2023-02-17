import ms from "ms";
import { isValidObjectId } from "mongoose";

import useTransaction from "../utils/use-transaction";
import Notification from "../models/notification.model";
import CustomError from "../utils/graphql/custom-error";

import type { ClientSession } from "mongoose";

class NotificationService {
    async create(data: NotificationCreateInput) {
        const { default: UserService } = await import("./user.service");

        if (!data.title) throw new CustomError("title is required");
        if (!data.message) throw new CustomError("message is required");
        if (!data.sourceId) throw new CustomError("sourceId is required");
        if (!data.receiverId) throw new CustomError("receiverId is required");

        if (data.sourceId === "system") {
            const systemUser = await UserService.getSystemUser();
            data.sourceId = systemUser.id;
        }

        const notification = await new Notification({ ...data, expiresAt: Date.now() + ms("120 days") }).save();

        return notification;
    }

    async getOne(userId: string, notificationId: string) {
        if (!isValidObjectId(userId)) throw new CustomError("Invalid User ID");
        if (!isValidObjectId(notificationId)) throw new CustomError("Invalid Notification ID");

        const notification = await Notification.findOne({ _id: notificationId });
        if (!notification) throw new CustomError("notification not found");

        if (notification.sourceId !== userId || notification.receiverId !== userId) throw new CustomError("Unauthorized access");

        return notification;
    }

    async getAll(pagination: PaginationInput) {
        /* Note:
         * - if sorting in ascending order (1) then use $gt
         * - if sorting in descending order (-1) then use $lt
         */
        const { limit = 5, next } = pagination;
        let query = {};

        const total = await Notification.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = notifications.length > limit;
        if (hasNext) notifications.pop(); // Remove the extra user from the array

        const nextCursor = hasNext
            ? `${notifications[notifications.length - 1]._id}_${notifications[notifications.length - 1].createdAt.getTime()}`
            : null;

        return {
            notifications,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }

    async getAllForUser(pagination: PaginationInput, userId: string) {
        /* Note:
         * - if sorting in ascending order (1) then use $gt
         * - if sorting in descending order (-1) then use $lt
         */
        const { limit = 5, next } = pagination;
        let query = { receiverId: userId } as any;

        const total = await Notification.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = notifications.length > limit;
        if (hasNext) notifications.pop(); // Remove the extra user from the array

        const nextCursor = hasNext
            ? `${notifications[notifications.length - 1]._id}_${notifications[notifications.length - 1].createdAt.getTime()}`
            : null;

        return {
            notifications,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        const notification = await this.getOne(userId, notificationId);

        const updatedNotification = await Notification.findOneAndUpdate({ _id: notification.id }, { $set: { readAt: Date.now() } }, { new: true });
        if (!updatedNotification) throw new CustomError("Notification not found");

        return updatedNotification;
    }

    async delete(userId: string, notificationId: string) {
        const notification = await this.getOne(userId, notificationId);

        const deletedNotification = await Notification.findOneAndDelete({ _id: notification.id });
        if (!deletedNotification) throw new CustomError("Notification not found");

        return deletedNotification;
    }

    async deleteMany(notificationIds: string[]) {
        await useTransaction(async (session: ClientSession) => {
            await Promise.all(
                notificationIds.map(async (notificationId) => {
                    if (!isValidObjectId(notificationId)) throw new CustomError("Invalid Notification ID");
                    await Notification.deleteOne({ _id: notificationId }, { session });
                })
            );
        });
    }
}

export default new NotificationService();
