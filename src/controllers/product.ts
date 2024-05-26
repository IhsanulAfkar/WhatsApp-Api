import { RequestHandler } from "express";
import logger from "../config/logger";
import prisma from "../utils/db";
import { isUUID } from "../utils/uuid";
import { diskUpload } from "../config/multer";

import fs from 'fs';
// export const createProduct: RequestHandler = async (req, res) => {
//     // add media as well
//     try {
//         diskUpload.single('media')(req, res, async (err: any) => {
//             if (err) {
//                 console.log(err)
//                 return res.status(400).json({ message: "Error uploading file" })
//             }
//             const {
//                 name,
//                 description = null,
//                 price,
//                 amount
//             } = req.body
//             const pkId = req.authenticatedUser.pkId
//             if (!name || !price || !amount)
//                 return res.status(404).json({ message: "name, price, or amount cannot be empty" })
//             // check if product name exist for same user
//             const checkProduct = await prisma.product.findFirst({
//                 where: {
//                     AND: [{ name }, { userId: pkId }]
//                 }
//             })
//             if (checkProduct)
//                 return res.status(404).json({ message: "Cannot have duplicate product name" })
//             // insert to db
//             const product = await prisma.product.create({
//                 data: {
//                     name,
//                     description,
//                     amount: parseInt(amount),
//                     price: parseFloat(price),
//                     media: req.file?.path,
//                     userId: pkId
//                 }
//             })
//             return res.status(200).json({ data: product })
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: 'Internal server error' });
//     }

// }
export const getAllProducts: RequestHandler = async (req, res) => {
    try {
        const userId = req.authenticatedUser.pkId
        const products = await prisma.product.findMany({
            where: { userId }
        })
        res.status(200).json(products)
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
            return res.status(404).json({ message: "No product exist" })

        return res.status(200).json(product)
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}
export const editProduct: RequestHandler = async (req, res) => {
    const { productId } = req.params

    const userId = req.authenticatedUser.pkId
    if (!isUUID(productId)) return res.status(400).json({ message: "invalid id" })
    try {
        diskUpload.single('media')(req, res, async (err: any) => {
            if (err) {
                console.log(err)
                return res.status(400).json({ message: 'Error uploading file' })
            }
            const { description, price, amount } = req.body
            const oldProduct = await prisma.product.findFirst({
                where: {
                    AND: [{ userId }, { id: productId }]
                }
            })
            if (!oldProduct)
                return res.status(404).json({ message: "No product exist" })
            // delete media in old product
            if (oldProduct.media) {
                fs.rm(oldProduct.media, err => {
                    if (err) {
                        console.error(`Error deleting file: ${err}`);
                    } else {
                        console.log(`File ${oldProduct.media} is deleted successfully.`);
                    }
                })
            }
            const newProduct = await prisma.product.update({
                where: {
                    id: productId
                },
                data: {
                    description: description || null,
                    media: req.file?.path,
                    price: parseFloat(price) || oldProduct.price,
                    amount: parseInt(amount) || oldProduct.amount
                }
            })
            res.status(200).json(newProduct)
        })
    } catch (error) {
        logger.error(error)
        console.log(error)
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
                amount: parseInt(amount)
            }
        })
        return res.status(200).json({ message: "Product updated successfully" })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error })
    }
}
// export const deleteProducts: RequestHandler = async (req, res) => {
//     const productIds: string[] = req.body.productIds
//     const userId = req.authenticatedUser.pkId
//     // console.log(productIds)
//     try {
//         const productPromises = productIds.map(async (productId) => {
//             const product = await prisma.product.findFirst({
//                 where: { userId, id: productId }
//             })
//             // console.log("product", product)
//             if (product) {
//                 await prisma.product.delete({
//                     where: { userId, id: productId }
//                 })
//                 if (product.media) {
//                     fs.rm(product.media, err => {
//                         if (err) {
//                             console.error(`Error deleting file: ${err}`);
//                         } else {
//                             console.log(`File ${product.media} is deleted successfully.`);
//                         }
//                     })
//                 }
//             }
//         })
//         await Promise.all(productPromises)
//         res.status(200).json({ message: "Product'(s) deleted successfully" })
//     } catch (error) {
//         logger.error(error)
//         console.log(error)
//         res.status(500).json({ message: 'Internal server error' })
//     }
// }