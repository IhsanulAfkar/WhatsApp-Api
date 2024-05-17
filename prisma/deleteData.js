const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllData() {
    try {
        // Delete all records from the User model
        await prisma.user.deleteMany({});
        await prisma.broadcast.deleteMany({})
        await prisma.device.deleteMany({})
        await prisma.deviceLog.deleteMany({})
        await prisma.session.deleteMany({})
        await prisma.contact.deleteMany({})
        await prisma.contactDevice.deleteMany({})
        await prisma.outgoingMessage.deleteMany({})
        await prisma.incomingMessage.deleteMany({})
        await prisma.autoReply.deleteMany({})
        await prisma.campaign.deleteMany({})
        await prisma.campaignMessage.deleteMany({})
        await prisma.product.deleteMany({})
        await prisma.orderProduct.deleteMany({})
        await prisma.transaction.deleteMany({})
        await prisma.passwordReset.deleteMany({})
        await prisma.message.deleteMany({})
        // Add similar deleteMany commands for other models as needed

        console.log('All data deleted successfully.');
    } catch (error) {
        console.error('Error deleting data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllData();