import { Job, scheduleJob } from "node-schedule"
import prisma from "./db"
import { getInstance } from "../whatsapp"
import { getRecipients } from "./recipients"

type ListJob = {
    id: string,
    job: Job
}
const listJob: ListJob[] = []

export const invokeBroadcast = async () => {
    try {
        const pendingBroadcasts = await prisma.broadcast.findMany({
            where: {
                schedule: {
                    lte: new Date(),
                },
                status: true,
                isSent: false
            },
            include: {
                device: {
                    select: {
                        sessions: { select: { sessionId: true } },
                        contactDevices: { select: { contact: true } },
                    },
                },
            },
        })
        for (const broadcast of pendingBroadcasts) {
            const processedRecipients: (string | number)[] = []
            const session = getInstance(broadcast.device.sessions[0].sessionId)!
            const recipients = await getRecipients(broadcast)
            const job = scheduleJob(broadcast.schedule, () => {

            })
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}