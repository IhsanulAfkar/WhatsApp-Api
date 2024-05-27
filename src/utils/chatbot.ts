import { Device } from "@prisma/client";
import prisma from "./db";
import { formatToIDR } from "./currency";

interface ListIntent {
    [key: string]: string
}
const listIntent: ListIntent = {
    "genshin.product.welkin": "Blessing of the Welkin Moon",
    "genshin.product.300": "300 Genesis Crystal",
    "genshin.product.980": "980 Genesis Crystal",
    "genshin.product.1980": "1980 Genesis Crystal",
    "genshin.product.3280": "3280 Genesis Crystal",
    "genshin.product.6480": "6480 Genesis Crystal",
    "genshin.product.hymnn": "Gnostic Hymnn",
    "genshin.product.chorus": "Gnostic Chorus",
    "hsr.product.express": "Express Pass",
    "hsr.product.300": "300 Oneiric Shard",
    "hsr.product.980": "980 Oneiric Shard",
    "hsr.product.1980": "1980 Oneiric Shard",
    "hsr.product.3280": "3280 Oneiric Shard",
    "hsr.product.6480": "6480 Oneiric Shard",
    "hsr.product.glory": "Nameless Glory",
    "hsr.product.medal": "Nameless Medal",
    "ml.product.weekly": "Weekly Diamond Pass",
    "ml.product.86": "86 Diamond",
    "ml.product.172": "172 Diamond",
    "ml.product.257": "257 Diamond",
    "ml.product.344": "344 Diamond",
    "ml.product.429": "429 Diamond",
    "ml.product.514": "514 Diamond",
    "ml.product.600": "600 Diamond",
    "ml.product.706": "706 Diamond",
    "ml.product.878": "878 Diamond",
    "ml.product.963": "963 Diamond",
    "ml.product.1050": "1050 Diamond",
    "ml.product.1220": "1220 Diamond",
    "ml.product.1412": "1412 Diamond",
    "ml.product.1669": "1669 Diamond",
    "ml.product.2195": "2195 Diamond",
    "ml.product.2901": "2901 Diamond",
    "ml.product.3688": "3688 Diamond",
    "ml.product.4394": "4394 Diamond",
    "ml.product.5532": "5532 Diamond",
    "ml.product.6238": "6238 Diamond",
    "ml.product.7727": "7727 Diamond",
    "ml.product.9288": "9288 Diamond",
    "ml.product.12976": "12976 Diamond",
}
export const processChatbot = async (device: Device, intent: string, confidence: number): Promise<string | null> => {
    console.log("intent")
    console.log(intent, confidence)
    if (confidence > 0.5) {
        const user = await prisma.user.findFirst({
            where: {
                devices: {
                    some: {
                        pkId: device.pkId
                    }
                }
            },
            include: { AutoReply: true }
        })
        if (!user)
            return null
        if (intent === 'greeting') {
            return `Selamat datang di ${user.AutoReply?.storeName}. Disini kami melayani jasa topup game:\n- Genshin Impact\n- Honkai Star Rail\n- Mobile Legends \nAda yang bisa kami bantu?\n\nMohon ketik 101 untuk berbicara langsung dengan admin dan mematikan fitur chatbot`
        }
        if (intent === 'payment')
            return user.AutoReply?.paymentReply || null
        if (intent === 'order') {
            return `Format order\nLogin via: PC\nEmail/username:\nPass:\nNick:\nOrder:\nServer:\nUID:`
        }
        if (intent === 'genshin.list') {
            const listGenshin = await prisma.product.findMany({
                where: {
                    game: 'Genshin'
                }
            })

            if (listGenshin.length == 0)
                return null
            const readyProducts = listGenshin.filter(prod => prod.amount > 0)
            if (readyProducts.length == 0) {
                return "Maaf, untuk topup genshin saat ini belum ready."
            }
            const reply = "Berikut daftar harga topup untuk Genshin Impact \n" + readyProducts.filter(prod => prod.amount > 0).map(prod => `- ${prod.name}: ${formatToIDR(prod.price)}`).join("\n")
            return reply;
        }
        if (intent === 'hsr.list') {
            const listHsr = await prisma.product.findMany({
                where: {
                    game: 'Honkai Star Rail'
                }
            })

            if (listHsr.length == 0)
                return null
            const readyProducts = listHsr.filter(prod => prod.amount > 0)
            if (readyProducts.length == 0) {
                return "Maaf, untuk topup Honkai Star Rail saat ini belum ready."
            }
            const reply = "Berikut daftar harga topup untuk Honkai Star Rail \n" + readyProducts.filter(prod => prod.amount > 0).map(prod => `- ${prod.name}: ${formatToIDR(prod.price)}`).join("\n")
            return reply;
        }
        if (intent === 'ml.list') {
            const listMl = await prisma.product.findMany({
                where: {
                    game: 'Mobile Legends'
                }
            })

            if (listMl.length == 0)
                return null
            const readyProducts = listMl.filter(prod => prod.amount > 0)
            if (readyProducts.length == 0) {
                return "Maaf, untuk topup Mobile Legend saat ini belum ready."
            }
            const reply = "Berikut daftar harga topup untuk Mobile Legend \n" + readyProducts.filter(prod => prod.amount > 0).map(prod => `- ${prod.name}: ${formatToIDR(prod.price)}`).join("\n")
            return reply;
        }
        if (intent === 'appreciation') {
            return "Terima kasih kembali :)"
        }
        // rest of intents are products
        const productName = listIntent[intent]
        const product = await prisma.product.findFirst({
            where: { name: productName, userId: user.pkId }
        })
        if (!product)
            return null
        if (product.amount == 0) {
            return `Mohon maaf, untuk ${product.name} sedang tidak ready`
        }
        return `${product.name}\n${formatToIDR(product.price)}\n${product.description || ""} \nReady ya`
    }
    return "Mohon maaf saya kurang mengerti maksud anda."
}