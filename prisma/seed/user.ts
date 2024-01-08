import { PrismaClient } from "@prisma/client";

const seedUsers = async (prisma: PrismaClient) => {
    try {
        await prisma.$connect()
        // const userData = [
        //     {

        //     }
        // ]
    } catch (error) {
        console.log(error)
    } finally {

    }
}
export default seedUsers