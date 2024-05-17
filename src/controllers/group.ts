import { RequestHandler } from 'express';
import prisma from '../utils/db';
import logger from '../config/logger';
import { isUUID } from '../utils/uuid';

export const getGroups: RequestHandler = async (req, res) => {
    const userId = req.authenticatedUser.pkId;

    try {
        const rawGroups = await prisma.group.findMany({
            where: {
                userId
            },
            include: { contactGroups: true },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const groups = [];

        for (const group of rawGroups) {
            const numberOfContacts = group.contactGroups.length;
            const groupCount = {
                ...group,
                membersCount: numberOfContacts,
            };

            groups.push(groupCount);
        }

        res.status(200).json(groups);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createGroup: RequestHandler = async (req, res) => {
    const { name } = req.body;
    const userId = req.authenticatedUser.pkId;
    try {
        // check group
        const isGroupExist = await prisma.group.findFirst({
            where: { name }
        })
        if (isGroupExist) {
            return res.status(400).json({ message: 'Cannot have duplicated group name' })
        }
        await prisma.group.create({
            data: {
                name,
                type: 'manual',
                user: { connect: { pkId: userId } },
            },
        });
        res.status(200).json({ message: 'Group created successfully' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addMemberToGroup: RequestHandler = async (req, res) => {
    try {
        const { groupId, contactIds } = req.body;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const addedContactIds: string[] = [];
        const failedContactIds: string[] = [];

        // use `Promise.all` to parallelize contact operations and track results
        // wait for all the Promises to settle (either resolve or reject)
        await Promise.all(
            contactIds.map(async (contactId: string) => {
                try {
                    const contact = await prisma.contact.findUnique({
                        where: { id: contactId },
                    });

                    if (!contact) {
                        return failedContactIds.push(contactId);
                    }
                    await prisma.contactGroup.upsert({
                        where: {
                            contactId_groupId: {
                                contactId: contact.pkId,
                                groupId: group.pkId,
                            },
                        },
                        create: {
                            contactId: contact.pkId,
                            groupId: group.pkId,
                        },
                        update: {
                            contactId: contact.pkId,
                            groupId: group.pkId,
                        },
                    });

                    addedContactIds.push(contactId);
                } catch (error) {
                    console.log(`Error adding contact ${contactId} to group:`, error);
                    failedContactIds.push(contactId);
                }
            }),
        );

        if (addedContactIds.length > 0) {
            res.status(200).json({
                message: 'Contact(s) added to group successfully',
                addedContactIds,
            });
        } else {
            res.status(404).json({
                message: 'No contacts were added to the group',
                failedContactIds,
            });
        }
    } catch (error) {
        logger.error(error);
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const removeMembersFromGroup: RequestHandler = async (req, res) => {
    try {
        const { groupId, contactIds } = req.body;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // wait for all the Promises to settle (either resolve or reject)
        // TODO
        let successDelete: string[] = []
        let failedDelete: { id: string, message: string }[] = []
        await Promise.all(
            contactIds.map(async (contactId: string) => {
                try {
                    const contact = await prisma.contact.findUnique({
                        where: { id: contactId },
                    });

                    if (!contact) {
                        failedDelete.push({
                            id: contactId,
                            message: `Contact with ID ${contactId} not found`
                        })
                        return
                        // return res
                        //     .status(404)
                        //     .json({ message: `Contact with ID ${contactId} not found` });
                    }

                    const groupContact = await prisma.contactGroup.findUnique({
                        where: {
                            contactId_groupId: {
                                contactId: contact.pkId,
                                groupId: group.pkId,
                            },
                        },
                    });
                    if (!groupContact) {
                        failedDelete.push({
                            id: contactId,
                            message: `Member with ID ${contactId} not found in the group`
                        })
                        return
                        // return res
                        //     .status(404)
                        //     .json({ message: `Member with ID ${contactId} not found in the group` });
                    }

                    await prisma.contactGroup.delete({
                        where: {
                            pkId: groupContact.pkId,
                        },
                    })
                    successDelete.push(contactId)
                } catch (error) {
                    failedDelete.push({
                        id: contactId,
                        message: 'Internal Server Error in id ' + contactId
                    })
                }
            }),
        );
        if (failedDelete.length > 0) {
            return res.status(207).json({
                message: `Members removed with ${failedDelete.length} of ${contactIds.length} failed`,
                success: successDelete,
                failed: failedDelete
            })
        }
        res.status(200).json({ message: 'Members removed from the group successfully' });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getGroup: RequestHandler = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        if (!isUUID(groupId)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: {
                contactGroups: {
                    include: {
                        contact: true,
                    },
                },
            },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json(group);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatedGroup: RequestHandler = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const { name } = req.body;

        if (!isUUID(groupId)) {
            return res.status(400).json({ message: 'Invalid groupId' });
        }

        const existingGroup = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!existingGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const updatedGroup = await prisma.group.update({
            where: { pkId: existingGroup.pkId },
            data: {
                name,
                updatedAt: new Date(),
            },
        });

        res.status(200).json({ message: 'Group updated successfully', data: updatedGroup });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteGroups: RequestHandler = async (req, res) => {
    try {
        const groupIds = req.body.groupIds;
        console.log(groupIds)
        const groupPromises = groupIds.map(async (groupId: string) => {
            await prisma.group.delete({
                where: { id: groupId },
            });
        });

        // wait for all the Promises to settle (either resolve or reject)
        await Promise.all(groupPromises);

        res.status(200).json({ message: 'Group(s) deleted successfully' });
    } catch (error) {
        // logger.error(error);
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
    }
};
