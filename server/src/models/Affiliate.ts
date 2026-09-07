import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPayoutItem {
  date: Date;
  amount: number;
  status: 'Pending' | 'Completed' | 'Rejected';
  referenceId?: string;
}

export interface IAffiliate extends Document {
  userId: mongoose.Types.ObjectId | string;
  code: string;
  referrals: number;
  earnings: number;
  payoutHistory: IPayoutItem[];
}

const AffiliateSchema = new Schema<IAffiliate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referrals: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    payoutHistory: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        status: {
          type: String,
          enum: ['Pending', 'Completed', 'Rejected'],
          default: 'Pending',
        },
        referenceId: { type: String },
      },
    ],
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

export const Affiliate: Model<IAffiliate> = mongoose.model<IAffiliate>(
  'Affiliate',
  AffiliateSchema
);
