import { Request, Response, Router } from "express";
import authRoutes from './auth'
import deviceRoutes from './device'
import sessionRoutes from './session'
import messageRoutes from './messages'
import contactRoutes from './contacts'
import autoReplyRoutes from './autoReply'
import productRoutes from './products'
import { authMiddleware } from "../middleware/auth";
const router = Router()
router.get("/", (req: Request, res: Response) => {
    res.send("Hello World!");
});
router.use('/auth', authRoutes)
router.use('/devices', authMiddleware, deviceRoutes)
router.use('/sessions', authMiddleware, sessionRoutes)
router.use('/messages', authMiddleware, messageRoutes)
router.use('/contacts', authMiddleware, contactRoutes)
router.use('/autoreply', authMiddleware, autoReplyRoutes)
router.use('/products', authMiddleware, productRoutes)
export default router