import mongoose, { Document, Schema } from "mongoose";

export interface INODEOrder extends Document {
  orderId: string;
  walletId: string;
  nodeId: Schema.Types.ObjectId | string;
  planDuration: 'monthly' | 'quaterly' | 'biannually';
  node: {
    nodeId: string;
    name: string;
    nodeImg: string;
    nodeLink: string;
  };
  inputData?: {
    fieldName: string;
    fieldValue: string;
  }[];
  outputData?: {
    fieldName: string;
    fieldValue: string;
  }[];
  status: 'pending' | 'processing' | 'deployed' | 'failed' | 'cancelled' | 'expired';
  orderDate: Date;
  amount:number;
  deployDate?: Date;
  expiryDate?: Date;
}

const nodeOrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    walletId: {
      type: String,
      required: true,
      trim: true,
    },
    nodeId: {
      type: Schema.Types.ObjectId,
      ref: 'NodePlan',
      required: true,
    },
    planDuration: {
      type: String,
      enum: ['monthly', 'quaterly', 'biannually'],
      required: true,
    },
    node: {
      nodeId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      nodeImg: {
        type: String,
        required: true,
      },
      nodeLink: {
        type: String,
        required: true,
      },
    },
    inputData: [
      {
        fieldName: {
          type: String,
        
        },
        fieldValue: {
          type: String,
          
        },
      },
    ],
    outputData: [
      {
        fieldName: {
          type: String,
        },
        fieldValue: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'deployed', 'failed', 'cancelled', 'expired'],
      default: 'pending',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deployDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const NodeOrder = mongoose.model<INODEOrder>('NodeOrder', nodeOrderSchema);