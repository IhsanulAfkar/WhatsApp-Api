-- CreateTable
CREATE TABLE "ChatbotSession" (
    "pkId" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChatbotSession_pkey" PRIMARY KEY ("pkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotSession_id_key" ON "ChatbotSession"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotSession_phone_key" ON "ChatbotSession"("phone");
