import { Request, Response, Router, static as static_ } from "express";
import authRoutes from './auth'
import userRoutes from './users'
import deviceRoutes from './device'
import sessionRoutes from './session'
import messageRoutes from './messages'
import broadcastRoutes from './broadcast'
import contactRoutes from './contacts'
import autoReplyRoutes from './autoReply'
import productRoutes from './products'
import orderRoutes from './orders'
import campaignRoutes from './campaign'
import groupRoutes from './groups'
import { authMiddleware } from "../middleware/auth";
const router = Router()
router.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
router.use('/auth', authRoutes)
router.use('/users', authMiddleware, userRoutes)
router.use('/devices', authMiddleware, deviceRoutes)
router.use('/sessions', authMiddleware, sessionRoutes)
router.use('/broadcasts', authMiddleware, broadcastRoutes)
router.use('/campaigns', authMiddleware, campaignRoutes)
router.use('/messages', authMiddleware, messageRoutes)
router.use('/contacts', authMiddleware, contactRoutes)
router.use('/groups', authMiddleware, groupRoutes)
router.use('/autoreply', authMiddleware, autoReplyRoutes)
router.use('/products', authMiddleware, productRoutes)
router.use('/orders', authMiddleware, orderRoutes)

router.use('/media', static_('media'))
export default router