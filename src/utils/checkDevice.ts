import { Device } from "@prisma/client"
import prisma from "./db"

export const isDeviceExist = async (deviceId: string) => {
    const checkDevice = await prisma.device.findFirst({
        where: { id: deviceId }
    })
    return !!checkDevice
}
export const checkDevice = async (deviceId: string, userId: number) => {
    const checkDevice = await prisma.device.findFirst({
        where: { AND: [{ id: deviceId }, { userId }] }
    })
    return checkDevice
}