import mongoose from "mongoose";

/**
 * Transaction wrapper for mongoose
 * @param {Function} callback Callback function to be executed
 */
const useTransaction = async (callback: Function) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        await callback(session);

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}


export default useTransaction;