import { PrismaClient } from "@prisma/client"

const seedDB = async () => {
    const prisma = new PrismaClient()
    try {

    } catch {

    } finally {
        prisma.$disconnect()
    }
}

seedDB()