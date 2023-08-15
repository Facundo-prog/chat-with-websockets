-- CreateTable
CREATE TABLE "WebchatUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "WebchatUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebchatMessage" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WebchatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebchatUser_username_key" ON "WebchatUser"("username");

-- AddForeignKey
ALTER TABLE "WebchatMessage" ADD CONSTRAINT "WebchatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebchatUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
