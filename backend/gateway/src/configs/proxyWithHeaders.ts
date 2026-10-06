import proxy from "express-http-proxy";
import type { Request } from "express";


export const proxyWithHeaders = (
    serviceUrl: string
) => {

    return proxy(
        serviceUrl,
        {

            proxyReqOptDecorator: (
                proxyReqOpts,
                srcReq: Request
            ) => {


                if (srcReq.user) {

                    proxyReqOpts.headers = {
                        ...proxyReqOpts.headers,

                        "x-user-id":
                            srcReq.user.userId.toString()

                    };

                }


                return proxyReqOpts;

            }

        }
    );

};