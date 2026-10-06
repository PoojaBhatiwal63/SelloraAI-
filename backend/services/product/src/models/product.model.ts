import mongoose, { Document, Schema } from "mongoose";


// ===============================
// PRODUCT LINK INTERFACE
// ===============================

interface IProductLink {

    title: string;

    url: string;

}


// ===============================
// PRODUCT INTERFACE
// ===============================

export interface IProduct extends Document {

    partnerId: mongoose.Types.ObjectId;

    title: string;

    slug: string;

    description: string;

    type:
    | "course"
    | "source-code"
    | "ebook"
    | "ui-kit"
    | "template"
    | "ai-prompt"
    | "software"
    | "other";


    price: number;


    links: IProductLink[];


    status:
    | "draft"
    | "published";


    totalSales: number;

    totalRevenue: number;


    createdAt: Date;

    updatedAt: Date;

}



// ===============================
// PRODUCT SCHEMA
// ===============================

const productSchema = new Schema<IProduct>(
{

    partnerId: {

        type: Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true

    },


    title: {

        type: String,

        required: true,

        trim: true

    },


    slug: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true,

        index: true

    },


    description: {

        type: String,

        required: true,

        trim: true

    },


    type: {

        type: String,

        enum: [
            "course",
            "source-code",
            "ebook",
            "ui-kit",
            "template",
            "ai-prompt",
            "software",
            "other"
        ],

        required: true,

        index: true

    },


    price: {

        type: Number,

        required: true,

        min: 0

    },




    links: [

        {

            title: {

                type: String,

                required: true,

                trim: true

            },


            url: {

                type: String,

                required: true,

                trim: true

            }

        }

    ],


    status: {

        type: String,

        enum: [
            "draft",
            "published"
        ],

        default: "draft",

        index: true

    },


    totalSales: {

        type: Number,

        default: 0

    },


    totalRevenue: {

        type: Number,

        default: 0

    }


},
{
    timestamps:true
}

);



// ===============================
// MODEL
// ===============================

const Product = mongoose.model<IProduct>(
    "Product",
    productSchema
);


export default Product;