

import { Device, User as PrismaUser } from '@prisma/client';
import { BaileysEventMap } from '@whiskeysockets/baileys';
// type authenticatedUser = {
//     pkId;
//     id;
//     firstName?;
//     lastName?;
//     username;
//     phone?;
//     email;
//     password;
//     accountApiKey?;
//     googleId?;
//     userId?;
//     deviceId?;
//     affiliationCode?;
//     emailOtpSecret?;
//     refreshToken?;
//     createdAt;
//     updatedAt;
//     emailVerifiedAt?;
// };
type AccessToken = {
    email: string;
};

type RefreshToken = {
    id: string;
};

declare global {
    namespace Express {
        interface Request {
            authenticatedUser: PrismaUser,
            device: Device
        }
    }
}

export type BaileysEventHandler<T extends keyof BaileysEventMap> = (
    args: BaileysEventMap[T],
) => void;

type TransformPrisma<T, TransformObject> = T extends Long
    ? number
    : T extends Uint8Array
    ? Buffer
    : T extends null
    ? never
    : T extends object
    ? TransformObject extends true
    ? object
    : T
    : T;

/** Transform unsupported types into supported Prisma types */
export type MakeTransformedPrisma<
    T extends Record<string, any>,
    TransformObject extends boolean = true,
> = {
        [K in keyof T]: TransformPrisma<T[K], TransformObject>;
    };

type SerializePrisma<T> = T extends Buffer
    ? {
        type: 'Buffer';
        data: number[];
    }
    : T extends bigint
    ? string
    : T extends null
    ? never
    : T;

export type MakeSerializedPrisma<T extends Record<string, any>> = {
    [K in keyof T]: SerializePrisma<T[K]>;
};

export type OrderDataTypes = {
    productId: string,
    quantity: number
}