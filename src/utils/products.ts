import prisma from "./db"
export const productData = [
    {
        name: "Blessing of the Welkin Moon",
        amount: 0,
        price: 65000,
        game: "Genshin"
    },
    {
        name: "300 Genesis Crystal",
        amount: 0,
        price: 65000,
        game: "Genshin"
    },
    {
        name: "980 Genesis Crystal",
        amount: 0,
        price: 195000,
        game: "Genshin"
    },
    {
        name: "1980 Genesis Crystal",
        amount: 0,
        price: 39500,
        game: "Genshin"
    },
    {
        name: "3280 Genesis Crystal",
        amount: 0,
        price: 650000,
        game: "Genshin"
    },
    {
        name: "6480 Genesis Crystal",
        amount: 0,
        price: 1225000,
        game: "Genshin"
    },
    {
        name: "Gnostic Hymnn",
        amount: 0,
        price: 140000,
        game: "Genshin"
    },
    {
        name: "Gnostic Chorus",
        amount: 0,
        price: 140000,
        game: "Genshin"
    },
    {
        name: "Express Pass",
        amount: 0,
        price: 65000,
        game: "Honkai Star Rail"
    },
    {
        name: "300 Oneiric Shard",
        amount: 0,
        price: 65000,
        game: "Honkai Star Rail"
    },
    {
        name: "980 Oneiric Shard",
        amount: 0,
        price: 195000,
        game: "Honkai Star Rail"
    },
    {
        name: "1980 Oneiric Shard",
        amount: 0,
        price: 39500,
        game: "Honkai Star Rail"
    },
    {
        name: "3280 Oneiric Shard",
        amount: 0,
        price: 650000,
        game: "Honkai Star Rail"
    },
    {
        name: "6480 Oneiric Shard",
        amount: 0,
        price: 1225000,
        game: "Honkai Star Rail"
    },
    {
        name: "Nameless Glory",
        amount: 0,
        price: 140000,
        game: "Honkai Star Rail"
    },
    {
        name: "Nameless Medal",
        amount: 0,
        price: 140000,
        game: "Honkai Star Rail"
    },
    {
        name: "Weekly Diamond Pass",
        amount: 0,
        price: 29000,
        game: "Mobile Legends"
    },
    {
        name: "86 Diamond",
        amount: 0,
        price: 24500,
        game: "Mobile Legends"
    },
    {
        name: "172 Diamond",
        amount: 0,
        price: 47000,
        game: "Mobile Legends"
    },
    {
        name: "257 Diamond",
        amount: 0,
        price: 67500,
        game: "Mobile Legends"
    },
    {
        name: "344 Diamond",
        amount: 0,
        price: 94000,
        game: "Mobile Legends"
    },
    {
        name: "429 Diamond",
        amount: 0,
        price: 114500,
        game: "Mobile Legends"
    },
    {
        name: "514 Diamond",
        amount: 0,
        price: 134700,
        game: "Mobile Legends"
    },
    {
        name: "600 Diamond",
        amount: 0,
        price: 159200,
        game: "Mobile Legends"
    },
    {
        name: "706 Diamond",
        amount: 0,
        price: 179200,
        game: "Mobile Legends"
    },
    {
        name: "878 Diamond",
        amount: 0,
        price: 226200,
        game: "Mobile Legends"
    },
    {
        name: "963 Diamond",
        amount: 0,
        price: 246500,
        game: "Mobile Legends"
    },
    {
        name: "1050 Diamond",
        amount: 0,
        price: 273200,
        game: "Mobile Legends"
    },
    {
        name: "1220 Diamond",
        amount: 0,
        price: 313000,
        game: "Mobile Legends"
    },
    {
        name: "1412 Diamond",
        amount: 0,
        price: 358400,
        game: "Mobile Legends"
    },
    {
        name: "1669 Diamond",
        amount: 0,
        price: 425500,
        game: "Mobile Legends"
    },
    {
        name: "2195 Diamond",
        amount: 0,
        price: 536200,
        game: "Mobile Legends"
    },
    {
        name: "2901 Diamond",
        amount: 0,
        price: 707500,
        game: "Mobile Legends"
    },
    {
        name: "3688 Diamond",
        amount: 0,
        price: 899000,
        game: "Mobile Legends"
    },
    {
        name: "4394 Diamond",
        amount: 0,
        price: 1080000,
        game: "Mobile Legends"
    },
    {
        name: "5532 Diamond",
        amount: 0,
        price: 1360000,
        game: "Mobile Legends"
    },
    {
        name: "6238 Diamond",
        amount: 0,
        price: 1542000,
        game: "Mobile Legends"
    },
    {
        name: "7727 Diamond",
        amount: 0,
        price: 1899000,
        game: "Mobile Legends"
    },
    {
        name: "9288 Diamond",
        amount: 0,
        price: 2260000,
        game: "Mobile Legends"
    },
    {
        name: "12976 Diamond",
        amount: 0,
        price: 3160000,
        game: "Mobile Legends"
    },
]
export const initProducts = async (userId: number) => {

    try {
        for (const product of productData) {
            await prisma.product.create({
                data: {
                    ...product,
                    userId
                }
            })
        }
        return null
    } catch (error) {
        return error
    }
}

