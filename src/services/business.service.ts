import { isValidObjectId } from "mongoose";
import Business from "../models/business.model";
import CustomError from "../utils/graphql/custom-error";

import type { ClientSession } from "mongoose";

class BusinessService {
    async create(data: BusinessCreateInput, userId: string, session?: ClientSession) {
        if (!userId) throw new CustomError("userId is missing");
        if (!data.city) throw new CustomError("city is required");
        if (!data.state) throw new CustomError("state is required");
        if (!data.country) throw new CustomError("country is required");
        if (!data.industry) throw new CustomError("industry is required");
        if (!data.companySize) throw new CustomError("company size is required");

        const business = await new Business({ userId, ...data }).save({ session });

        return business;
    }

    async getByUserId(userId: string, throwError = true) {
        if (!isValidObjectId(userId)) throw new CustomError("Invalid userId");

        const business = await Business.findOne({ userId });
        if (!business && throwError) throw new CustomError("Business not found");

        return business;
    }

    async update(businessId: string, data: BusinessUpdateInput) {
        if (!isValidObjectId(businessId)) throw new CustomError("Invalid businessId");

        const business = await Business.findOneAndUpdate({ _id: businessId }, { $set: { data } }, { new: true });
        if (!business) throw new CustomError("Specified business does not exit");

        return business;
    }

    async updateByUser(userId: string, data: BusinessUpdateInput) {
        if (!isValidObjectId(userId)) throw new CustomError("Invalid businessId");

        const business = await Business.findOneAndUpdate({ userId });
        if (!business) throw new CustomError("User has not business profile");

        return await this.update(business.id, data);
    }
}

export default new BusinessService();
