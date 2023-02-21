import { ROLE } from "../../config";
import CustomError from "../../utils/graphql/custom-error";

import type { IUser } from "../../models/user.model";

export default (user: IUser | null, roles?: string[]) => {
    if (!user) throw new CustomError("Unauthorized: Please login to continue", "UNAUTHENTICATED");
    if (!user.isActive) throw new CustomError("Unauthorized: User has been deactivated", "USER_DEACTIVATED");
    if (!user.isVerified) throw new CustomError("Unauthorized: Please verify email address", "EMAIL_NOT_VERIFIED");

    if (!roles) roles = ROLE.USER;
    if (!roles.includes(user.role)) throw new CustomError("unauthorized access", "UNAUTHORIZED_ACCESS");

    return user;
};
