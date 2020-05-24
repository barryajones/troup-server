import { Request, Response } from 'express-serve-static-core';
import { PrismaClient } from '@prisma/client';

export function middlewareUser(prisma: PrismaClient) {
    return async function(request: Request, response: Response, next: Function): Promise<void> {
        delete request.headers.isSUperAdmin;

        if (request.headers.su) {
            try {
                const user = await prisma.user.findOne({
                    where: { id: parseInt(request.headers.userId as string, 10) },
                    select: {
                        profile: {
                            select: {
                                isSuperAdmin: true,
                            },
                        },
                    },
                });
                if (user.profile.isSuperAdmin) {
                    request.headers.isSuperAdmin = 'true';
                } else {
                    delete request.headers.isSuperAdmin;
                }
            } catch (error) {
                console.log('USER_MIDDLEWARE', error.message);
                response.removeHeader('su');
            }
        }

        next();
    };
}
