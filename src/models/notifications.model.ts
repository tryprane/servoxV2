import mongoose, { Document, Schema } from "mongoose";

interface INotification extends Document {
    walletId: string;
    message: string;
    type: string;

}

const notificationSchema = new Schema({
    walletId: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;