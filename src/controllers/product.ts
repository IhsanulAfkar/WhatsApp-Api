import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";

export const createProduct: RequestHandler = async (req, res) => {
    const {
        name,
        description = null,
        price,
        amount
    } = req.body

    const pkId = req.authenticatedUser.pkId
    if (!name || !price || !amount)
        return res.status(404).json({ message: "name, price, or amount cannot be empty" })
    try {
        // check if product name exist for same user
        const checkProduct = await prisma.product.findFirst({
            where: {
                AND: [{ name }, { userId: pkId }]
            }
        })
        if (checkProduct)
            return res.status(404).json({ message: "Cannot have duplicate product name" })
        // insert to db
        const product = await prisma.product.create({
            data: {
                name,
                description,
                amount,
                price,
                userId: pkId
            }
        })
        return res.status(200).json({ data: product })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}
export const getAllProducts: RequestHandler = async (req, res) => {
    try {
        const userId = req.authenticatedUser.pkId
        const products = await prisma.product.findMany({
            where: { userId }
        })
        res.status(200).json({ data: products })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}