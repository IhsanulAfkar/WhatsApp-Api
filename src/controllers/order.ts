import { RequestHandler } from "express";
import logger from "../config/logger";
import { OrderDataTypes } from "../types";
import { Contact, Device, Order, OrderStatus, Product } from "@prisma/client";
import prisma from "../utils/db";
import { generateUuid, isUUID } from "../utils/uuid";
import { ORDER_STATUS } from '../utils/constants'
import { checkDevice } from "../utils/checkDevice";
export const createOrder: RequestHandler = async (req, res) => {
	const { phone, deviceId, name = '', notes = '' } = req.body
	const orders: OrderDataTypes[] = req.body.orders
	const userId = req.authenticatedUser.pkId
	if (!phone || orders.length === 0 || !deviceId)
		return res.status(400).json({ message: "phone, order, adn deviceId cannot be empty" })
	try {
		const checkDevice = await prisma.device.findFirst({
			where: {
				AND: [{ id: deviceId }, { userId }]
			}
		})
		if (!checkDevice)
			return res.status(404).json({ message: "invalid deviceId" })
		const existingContact = await prisma.contact.findFirst({
			where: { phone }
		})
		let listProduct: Array<OrderDataTypes & { pkId: number, newAmount: number }> = []
		for (const order of orders) {
			const checkProduct = await prisma.product.findFirst({
				where: { AND: [{ id: order.productId }, { userId }] }
			})
			if (!checkProduct) {
				return res.status(404).json({ message: `no product found`, productId: order.productId })
			}
			const newAmount = checkProduct.amount - order.quantity
			if (newAmount < 0) {
				return res.status(400).json({ message: `insufficient amount for product`, productId: order.productId })
			}
			listProduct.push({ ...order, pkId: checkProduct.pkId, newAmount })

		}

		await prisma.$transaction(async (tx) => {
			listProduct.forEach(async (prod) => {
				await tx.product.update({
					where: { id: prod.productId },
					data: { amount: prod.newAmount }
				})
			})

			// create order table
			const newOrder = await tx.order.create({
				data: {
					phoneNumber: phone,
					contactId: existingContact ? existingContact.pkId : null,
					id: generateUuid(),
					name: name || `${phone}'s order`,
					notes: notes,
					deviceId: checkDevice.pkId,
					OrderProduct: {
						create: listProduct.map(prod => ({
							product: { connect: { pkId: prod.pkId } },
							quantity: prod.quantity
						}))
					}
				},
				include: {
					OrderProduct: {
						include: {
							product: true
						}
					}
				}
			})
			return res.status(200).json(newOrder)
		})

	} catch (error) {
		logger.error(error)
		console.log(error)
		res.status(500).json({ error: error })
	}
}

export const getAllOrders: RequestHandler = async (req, res) => {
	const userId = req.authenticatedUser.pkId
	const status = req.query.status as string
	if (status && !ORDER_STATUS.includes(status)) {
		return res.status(400).json({ message: "invalid order status" })
	}
	try {
		const device = await prisma.device.findFirst({
			where: { userId }
		})
		if (!device) {
			return res.status(400).json({ message: "Device not exist" })
		}
		const orders = await prisma.order.findMany({
			where: {
				deviceId: device.pkId,
				status: status as any ?? undefined
			},
			include: {
				OrderProduct: {
					include: {
						product: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
		const newOrders = orders.map(order => {
			let price = 0
			order.OrderProduct.map(ordProd => {
				price += ordProd.product.price * ordProd.quantity
			})
			return {
				...order,
				total: price
			}
		})
		return res.status(200).json(newOrders)
	} catch (error) {
		logger.error(error)
		return res.status(500).json({ error: error })
	}
}

export const changeOrderStatus: RequestHandler = async (req, res) => {
	const { orderId } = req.params
	const { status } = req.body
	const userId = req.authenticatedUser.pkId
	const device = req.device
	if (!status || !orderId)
		return res.status(400).json({ message: "order and status cannot be empty" })
	if (!ORDER_STATUS.includes(status) || status === "CREATED")
		return res.status(400).json({ message: "invalid order status" })

	if (!isUUID(orderId))
		return res.status(400).json({ message: "invalid orderId" })

	try {

		const checkOrder = await prisma.order.findFirst({
			where: {
				AND: [{ id: orderId }, { deviceId: device.pkId }]
			}
		})
		if (!checkOrder) {
			return res.status(404).json({ message: "order not found" })
		}
		if (checkOrder.status === "COMPLETED") {
			return res.status(400).json({ message: "order already completed" })
		}
		if (checkOrder.status === "CANCELLED") {
			return res.status(400).json({ message: "order already cancelled, please create a new order" })
		}

		await prisma.$transaction(async (tx) => {
			const allProducts = await tx.orderProduct.findMany({
				where: { orderId: checkOrder.pkId },
				include: {
					product: {
						select: {
							name: true,
							price: true,
							id: true,
							amount: true
						}
					}
				}
			})
			if (status === "COMPLETED") {
				// create transaction as receipt
				const newOrder = await tx.order.update({
					where: { id: checkOrder.id },
					data: {
						status
					}
				})
				console.log("ini allProducts")
				console.log(allProducts)
				const totalPrice = allProducts.reduce((accumulator, item) => {
					return accumulator + (item.quantity * item.product.price)
				}, 0)
				const newTransaction = await prisma.transaction.create({
					data: {
						phoneNumber: newOrder.phoneNumber,
						contactId: newOrder.contactId || undefined,
						orderData: JSON.stringify(allProducts.map(item => ({ name: item.product.name, quantity: item.quantity, price: item.product.price }))),
						userId,
						totalPrice,
					}
				})
				return res.status(200).json({ message: "order completed" })
			} else if (status === "CANCELLED") {
				// return stock of products
				for (const item of allProducts) {
					await tx.product.update({
						where: {
							id: item.product.id,
						},
						data: {
							amount: item.product.amount + item.quantity
						}
					})
				}

				const newOrder = await tx.order.update({
					where: { id: checkOrder.id },
					data: {
						status
					}
				})
				return res.status(200).json({ message: "order has been cancelled", data: newOrder })
			}
			else {
				const newOrder = await tx.order.update({
					where: { id: checkOrder.id },
					data: {
						status
					}
				})
				return res.status(200).json({ message: "order status updated successfully", data: newOrder })
			}
		})
	} catch (error) {
		// logger.error(error)
		console.log(error)
		return res.status(500).json({ error: error })
	}
}
export const getOrder: RequestHandler = async (req, res) => {
	const { orderId } = req.params
	const device = req.device
	if (!isUUID(orderId))
		return res.status(400).json({ message: "invalid orderId" })
	try {
		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				deviceId: device.pkId
			},
			include: {
				OrderProduct: {
					include: {
						product: true
					}
				}
			}
		})
		if (!order) {
			return res.status(404).json({ message: 'Order not found' })
		}
		let total = 0
		order.OrderProduct.forEach(orderProd => {
			total += orderProd.quantity * orderProd.product.price
		})
		return res.status(200).json({ ...order, total })
	} catch (error) {
		logger.error(error)
		return res.status(500).json({ error: error })
	}
}