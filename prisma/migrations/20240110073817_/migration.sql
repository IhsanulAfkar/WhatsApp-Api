-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(128) NOT NULL,
    "last_name" VARCHAR(128),
    "username" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "account_api_key" VARCHAR(128),
    "google_id" VARCHAR(128),
    "email_otp_secret" VARCHAR(255),
    "refresh_token" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verfied_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Device" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "phone" VARCHAR(20),
    "api_key" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'close',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "DeviceLog" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceLog_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Session" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Contact" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(128) NOT NULL,
    "lastName" VARCHAR(128),
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "gender" VARCHAR(10),
    "colorCode" VARCHAR(6),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "ContactGroup" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "ContactGroup_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "ContactDevice" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "contactId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "ContactDevice_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Group" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "type" VARCHAR(128) NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "OutgoingMessage" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "message" TEXT,
    "mediaPath" TEXT,
    "schedule" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "contactId" INTEGER,

    CONSTRAINT "OutgoingMessage_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "IncomingMessage" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "mediaPath" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "contactId" INTEGER,

    CONSTRAINT "IncomingMessage_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "recipients" TEXT[],
    "message" VARCHAR(255) NOT NULL,
    "schedule" TIMESTAMP(3) NOT NULL,
    "delay" INTEGER NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "mediaPath" TEXT,
    "deviceId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "AutoReply" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "requests" TEXT[],
    "response" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "recipients" TEXT[],
    "mediaPath" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" INTEGER NOT NULL,

    CONSTRAINT "AutoReply_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "registration_syntax" VARCHAR(128) NOT NULL,
    "unregistration_syntax" VARCHAR(128) NOT NULL,
    "registration_message" VARCHAR(255) NOT NULL,
    "message_registered" VARCHAR(255) NOT NULL,
    "message_failed" VARCHAR(255) NOT NULL,
    "message_unregistered" VARCHAR(255) NOT NULL,
    "recipients" TEXT[],
    "delay" INTEGER NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TIMESTAMP(3) NOT NULL,
    "mediaPath" TEXT,
    "group_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "CampaignMessage" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "delay" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "schedule" TIMESTAMP(3) NOT NULL,
    "mediaPath" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMessage_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Product" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "media" TEXT,
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "pkId" SERIAL NOT NULL,
    "id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "phone" TEXT,
    "contactId" INTEGER NOT NULL,
    "orderData" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "deviceId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "OrderProduct" (
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("orderId","productId")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "reset_token_expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("pkId")
);

-- CreateTable
CREATE TABLE "Message" (
    "pkId" BIGSERIAL NOT NULL,
    "sessionId" TEXT,
    "remoteJid" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "agentId" TEXT,
    "bizPrivacyStatus" INTEGER,
    "broadcast" BOOLEAN,
    "clearMedia" BOOLEAN,
    "duration" INTEGER,
    "ephemeralDuration" INTEGER,
    "ephemeralOffToOn" BOOLEAN,
    "ephemeralOutOfSync" BOOLEAN,
    "ephemeralStartTimestamp" BIGINT,
    "finalLiveLocation" JSONB,
    "futureproofData" BYTEA,
    "ignore" BOOLEAN,
    "keepInChat" JSONB,
    "key" JSONB NOT NULL,
    "labels" JSONB,
    "mediaCiphertextSha256" BYTEA,
    "mediaData" JSONB,
    "message" JSONB,
    "messageC2STimestamp" BIGINT,
    "messageSecret" BYTEA,
    "messageStubParameters" JSONB,
    "messageStubType" INTEGER,
    "messageTimestamp" BIGINT,
    "multicast" BOOLEAN,
    "originalSelfAuthorUserJidString" TEXT,
    "participant" TEXT,
    "paymentInfo" JSONB,
    "photoChange" JSONB,
    "pollAdditionalMetadata" JSONB,
    "pollUpdates" JSONB,
    "pushName" TEXT,
    "quotedPaymentInfo" JSONB,
    "quotedStickerData" JSONB,
    "reactions" JSONB,
    "revokeMessageTimestamp" BIGINT,
    "starred" BOOLEAN,
    "status" INTEGER,
    "statusAlreadyViewed" BOOLEAN,
    "statusPsa" JSONB,
    "urlNumber" BOOLEAN,
    "urlText" BOOLEAN,
    "userReceipt" JSONB,
    "verifiedBizName" TEXT,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("pkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_account_api_key_key" ON "User"("account_api_key");

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_refresh_token_key" ON "User"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "Device_id_key" ON "Device"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_api_key_key" ON "Device"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceLog_id_key" ON "DeviceLog"("id");

-- CreateIndex
CREATE INDEX "Session_sessionId_idx" ON "Session"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_id_per_session_id_session" ON "Session"("sessionId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_id_key" ON "Contact"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactGroup_id_key" ON "ContactGroup"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactGroup_contactId_groupId_key" ON "ContactGroup"("contactId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactDevice_id_key" ON "ContactDevice"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactDevice_contactId_deviceId_key" ON "ContactDevice"("contactId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_id_key" ON "Group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OutgoingMessage_id_key" ON "OutgoingMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_outgoing_message_key_per_session_id" ON "OutgoingMessage"("sessionId", "to", "id");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingMessage_id_key" ON "IncomingMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Broadcast_id_key" ON "Broadcast"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AutoReply_id_key" ON "AutoReply"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_id_key" ON "Campaign"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_registration_syntax_key" ON "Campaign"("registration_syntax");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_unregistration_syntax_key" ON "Campaign"("unregistration_syntax");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMessage_id_key" ON "CampaignMessage"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "Product"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_id_key" ON "Order"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_id_key" ON "PasswordReset"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_email_key" ON "PasswordReset"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "Message_sessionId_idx" ON "Message"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_message_key_per_session_id" ON "Message"("sessionId", "remoteJid", "id");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLog" ADD CONSTRAINT "DeviceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactGroup" ADD CONSTRAINT "ContactGroup_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactGroup" ADD CONSTRAINT "ContactGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDevice" ADD CONSTRAINT "ContactDevice_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactDevice" ADD CONSTRAINT "ContactDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutgoingMessage" ADD CONSTRAINT "OutgoingMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncomingMessage" ADD CONSTRAINT "IncomingMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoReply" ADD CONSTRAINT "AutoReply_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMessage" ADD CONSTRAINT "CampaignMessage_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("pkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("pkId") ON DELETE RESTRICT ON UPDATE CASCADE;
