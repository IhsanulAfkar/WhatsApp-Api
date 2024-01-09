import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";
import { isUUID } from "../utils/uuid";

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
export const getProduct: RequestHandler = async (req, res) => {
    const { productId } = req.params
    if (!isUUID(productId)) return res.status(404).json({ message: "invalid id" })
    try {
        const userId = req.authenticatedUser.pkId
        const product = await prisma.product.findFirst({
            where: {
                AND: [{ userId }, { id: productId }]
            }
        })
        if (!product)
            return res.status(200).json({ message: "No product exist" })

        return res.status(200).json(product)
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}
export const editProduct: RequestHandler = async (req, res) => {
    const { productId } = req.params
    const { name, description, price } = req.body
    const userId = req.authenticatedUser.pkId
    if (!isUUID(productId)) return res.status(400).json({ message: "invalid id" })
    try {
        // check and fetch old product
        const oldProduct = await prisma.product.findFirst({
            where: {
                AND: [{ userId }, { id: productId }]
            }
        })
        if (!oldProduct)
            return res.status(404).json({ message: "No product exist" })
        // check if product with new name exist
        const checkProduct = await prisma.product.findFirst({
            where: {
                AND: [{ userId }, { name }]
            }
        })
        if (checkProduct)
            return res.status(400).json({ message: "Cannot have duplicate product name" })
        const newProduct = await prisma.product.update({
            where: {
                id: productId
            },
            data: {
                name: name || oldProduct.name,
                description: description,
                price: price || oldProduct.price
            }
        })
        res.status(200).json(newProduct)
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}
export const changeAmount: RequestHandler = async (req, res) => {
    const { productId } = req.params
    const { amount } = req.body
    const userId = req.authenticatedUser.pkId
    if (!isUUID(productId)) return res.status(400).json({ message: "invalid id" })
    try {
        const checkProduct = await prisma.product.findFirst({
            where: {
                AND: [{ userId }, { id: productId }]
            }
        })
        if (!checkProduct)
            return res.status(400).json({ message: "Cannot have duplicate product name" })
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                amount
            }
        })
        return res.status(200).json({ message: "Product updated successfully" })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}