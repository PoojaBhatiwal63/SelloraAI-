import mongoose, { Document, Schema } from "mongoose";


export interface IOrder extends Document {

    productId: mongoose.Types.ObjectId;

    partnerId: mongoose.Types.ObjectId;


    // Product snapshot
    productTitle: string;

    productPrice: number;

    // Product access links snapshot

links: {
    title:string;
    url:string;
}[];


// Partner email snapshot

partnerEmail:string;



    // Customer details

    customerName: string;

    customerEmail: string;



    // Razorpay

    razorpayOrderId?: string;

    razorpayPaymentId?: string;

    razorpaySignature?: string;



    // Payment

    paymentStatus:
    | "pending"
    | "success"
    | "failed";


    // Revenue split

    partnerAmount: number;

    adminAmount: number;



    createdAt: Date;

    updatedAt: Date;

}



const orderSchema = new Schema<IOrder>(
{

    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        index:true
    },


    partnerId: {
        type: Schema.Types.ObjectId,
        required:true,
        index:true
    },



    productTitle:{
        type:String,
        required:true
    },


    productPrice:{
        type:Number,
        required:true
    },

    partnerEmail:{
    type:String,
    required:true,
    lowercase:true,
    trim:true
},


links:[
    {
        title:{
            type:String,
            required:true,
            trim:true
        },

        url:{
            type:String,
            required:true,
            trim:true
        }
    }
],



    customerName:{
        type:String,
        required:true,
        trim:true
    },


    customerEmail:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },



    razorpayOrderId:{
        type:String,
        index:true
    },


    razorpayPaymentId:{
        type:String
    },


    razorpaySignature:{
        type:String
    },



    paymentStatus:{
        type:String,
        enum:[
            "pending",
            "success",
            "failed"
        ],
        default:"pending",
        index:true
    },



    partnerAmount:{
        type:Number,
        default:0
    },


    adminAmount:{
        type:Number,
        default:0
    }


},
{
    timestamps:true
});


const Order = mongoose.model<IOrder>(
    "Order",
    orderSchema
);


export default Order;