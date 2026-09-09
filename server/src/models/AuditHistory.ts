import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAuditHistory extends Document {
  userId: mongoose.Types.ObjectId | string;
  type: 'product' | 'process' | 'transaction';
  input: any;
  output: any;
  timestamp: Date;
}

const AuditHistorySchema = new Schema<IAuditHistory>(
  {
    userId: {
      type: Schema.Types.Mixed,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['product', 'process', 'transaction'],
      required: true,
    },
    input: {
      type: Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AuditHistory: Model<IAuditHistory> = mongoose.model<IAuditHistory>(
  'AuditHistory',
  AuditHistorySchema
);
