/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from 'express';
import prisma from '../utils/db';
import { getInstance, getJid, sendMediaFile } from '../whatsapp';
import logger from '../config/logger'
import { ChatbotResponse } from '../types';
import { processChatbot } from '../utils/chatbot';
import { ChatbotSession } from '@prisma/client';

export const updateAutoReplyStatus: RequestHandler = async (req, res) => {
    try {
        const userId = req.authenticatedUser.pkId
        const status = req.body.status
        // check if storename and payment is filled
        const checkAR = await prisma.autoReply.findFirst({
            where: { userId }
        })

        if (!checkAR?.paymentReply || !checkAR.storeName) {
            res.status(400).json({ message: "auto reply not yet allowed" })
            return
        }
        await prisma.device.updateMany({
            where: { userId },
            data: {
                isAutoReply: status,
                updatedAt: new Date(),
            },
        });

        res.status(200).json({ status });
    } catch (error) {
        logger.error(error);
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getAutoReply: RequestHandler = async (req, res) => {
    try {
        const userId = req.authenticatedUser.pkId
        const autoReply = await prisma.autoReply.findFirst({
            where: { userId }
        });

        res.status(200).json(autoReply);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}
export const editAutoReply: RequestHandler = async (req, res) => {
    try {
        const { paymentMessage, storeName } = req.body
        const userId = req.authenticatedUser.pkId
        const oldAR = await prisma.autoReply.findFirst({
            where: { userId }
        })
        const autoReply = await prisma.autoReply.update({
            where: { userId },
            data: {
                paymentReply: paymentMessage || oldAR?.paymentReply,
                storeName: storeName || oldAR?.storeName,
            }
        })
        res.status(200).json({ message: "success update auto reply" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const createAutoReply = async (userId: number) => {
    try {
        await prisma.autoReply.create({
            data: {
                userId,
            }
        })
        return null
    } catch (error) {
        return error
    }
}
export const getChatbotSession: RequestHandler = async (req, res) => {
    const { deviceId, phone } = req.params

    const chatbotSession = await prisma.chatbotSession.findFirst({
        where: {
            deviceId, phone
        }
    })
    if (!chatbotSession) {
        res.status(404).json({ message: "chatbot session not found" })
        return
    }
    res.status(200).json(chatbotSession)

}
export const updateChatbotSession: RequestHandler = async (req, res) => {
    const { deviceId = '', phone } = req.params
    const { status } = req.body
    const chatbotSession = await prisma.chatbotSession.findFirst({
        where: {
            deviceId, phone
        }
    })
    if (!chatbotSession) {
        res.status(404).json({ message: "chatbot session not found" })
        return
    }

    await prisma.chatbotSession.update({
        where: {
            deviceId, phone
        },
        data: {
            isActive: status
        }
    })
    res.status(200).json({ message: "success update status" })
}
export async function sendAutoReply(phone: string, sessionId: any, data: any) {
    try {
        const session = getInstance(sessionId)!;
        const recipient = data.key.remoteJid;
        const jid = getJid(recipient);
        const phoneNumber = recipient.split('@')[0];
        const name = data.pushName;
        const messageText: string =
            data.message?.conversation ||
            data.message?.extendedTextMessage?.text ||
            data.message?.imageMessage?.caption ||
            '';
        // send if autoreply is on
        const checkAR = await prisma.device.findFirst({
            where: {
                sessions: {
                    some: {
                        sessionId
                    }
                }
            }
        })
        // if no device get
        if (!checkAR) {
            return
        }
        // check if customer doesnt want chatbot
        if (messageText === "101") {
            await prisma.chatbotSession.upsert({
                where: { phone },
                update: { isActive: false },
                create: {
                    phone,
                    isActive: false,
                    deviceId: checkAR.id
                }
            })
            const responseText = "Fitur chatbot telah dimatikan, mohon menunggu admin untuk membalas pesan anda..."
            session.readMessages([data.key]);
            session.sendMessage(
                jid,
                { text: responseText },
                { quoted: data },
            );
            return
        }

        if (checkAR.isAutoReply) {
            // check if chatbot session active
            let chatbotSession: ChatbotSession | null
            chatbotSession = await prisma.chatbotSession.findFirst({
                where: { phone, deviceId: checkAR.id }
            })
            if (!chatbotSession) {
                chatbotSession = await prisma.chatbotSession.create({
                    data: { phone, deviceId: checkAR.id }
                })
            }
            if (!chatbotSession.isActive) {
                return
            }
            // detect if its an order
            if (messageText.includes("Format order")) {
                await prisma.chatbotSession.update({
                    where: { phone, deviceId: checkAR.id },
                    data: { isActive: false }
                })
                const replyText = "Terima kasih sudah order di tempat kami, mohon lampirkan bukti transfer untuk diproses lebih lanjut"
                session.readMessages([data.key])
                session.sendMessage(
                    jid,
                    { text: replyText },
                    { quoted: data },
                )
                return
            }
            // get response from chatbot
            const result = await fetch(process.env.CHATBOT_URL! + '/chat', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: messageText })
            })
            if (result.ok) {
                const resultData: ChatbotResponse = await result.json()
                // get user by session

                // console.log(resultData)
                const responseText = await processChatbot(checkAR, resultData.intent, resultData.confidence)
                if (!responseText) {
                    return
                }
                session.readMessages([data.key]);
                session.sendMessage(
                    jid,
                    { text: responseText },
                    { quoted: data },
                );
            } else {
                console.log(result.status)
                console.log(await result.text())

            }
        }
        // const matchingAutoReply = await prisma.autoReply.findFirst({
        //     where: {
        //         AND: [
        //             {
        //                 requests: {
        //                     has: messageText,
        //                 },
        //                 status: true,
        //                 device: { sessions: { some: { sessionId } } },
        //             },
        //             {
        //                 OR: [
        //                     {
        //                         recipients: { has: phoneNumber },
        //                     },
        //                     { recipients: { has: '*' } },
        //                     {
        //                         recipients: { has: 'all' },
        //                         device: {
        //                             contactDevices: { some: { contact: { phone: phoneNumber } } },
        //                         },
        //                     },
        //                 ],
        //             },
        //         ],
        //     },
        //     include: { device: { select: { contactDevices: { select: { contact: true } } } } },
        // });

        // if (matchingAutoReply) {
        //     const replyText = matchingAutoReply.response;

        //     session.readMessages([data.key]);
        //     if (matchingAutoReply.mediaPath) {
        //         await sendMediaFile(
        //             session,
        //             [jid],
        //             {
        //                 url: matchingAutoReply.mediaPath,
        //                 newName: matchingAutoReply.mediaPath.split('/').pop(),
        //             },
        //             ['jpg', 'png', 'jpeg'].includes(
        //                 matchingAutoReply.mediaPath.split('.').pop() || '',
        //             )
        //                 ? 'image'
        //                 : 'document',
        //             replyText,
        //             data,
        //         );
        //     } else {
        //         session.sendMessage(
        //             jid,
        //             { text: replyText },
        //             { quoted: data },
        //         );
        //     }
        //     logger.warn(matchingAutoReply, 'auto reply response sent successfully');
        // }
    } catch (error) {
        logger.error(error);
        console.log(error)
    }
}
