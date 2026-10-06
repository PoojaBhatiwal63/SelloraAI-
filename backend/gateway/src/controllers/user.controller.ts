import { Request, Response } from "express";


export const getCurrentUser = async(
    req: Request,
    res: Response
)=>{

    try {


        return res.status(200).json({

            success:true,

            user:req.user

        });


    } catch(error){


        const message =
            error instanceof Error
            ? error.message
            : "Something went wrong";


        return res.status(500).json({

            success:false,

            message

        });

    }

};