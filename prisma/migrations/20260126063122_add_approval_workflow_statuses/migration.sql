-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SP_HAR', 'SPS_HAR', 'OP_LOKAL', 'OP_CCR', 'PELAKSANA_HAR');

-- CreateEnum
CREATE TYPE "LotoType" AS ENUM ('TAGGING', 'RELEASE');

-- CreateEnum
CREATE TYPE "LotoStatus" AS ENUM ('DRAFT', 'PENDING_HAR', 'PENDING_OP', 'PROGRESS', 'PENDING_RELEASE', 'CLOSE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "department" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ldap_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loto_requests" (
    "id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,
    "type" "LotoType" NOT NULL,
    "status" "LotoStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "operator_id" TEXT,
    "form_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "loto_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loto_approvals" (
    "id" TEXT NOT NULL,
    "loto_request_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "step" VARCHAR(50) NOT NULL,
    "approver_role" "UserRole" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loto_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loto_history" (
    "id" TEXT NOT NULL,
    "loto_request_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "old_status" "LotoStatus",
    "new_status" "LotoStatus",
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loto_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loto_attachments" (
    "id" TEXT NOT NULL,
    "loto_request_id" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "attachment_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loto_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tagging_cards" (
    "id" TEXT NOT NULL,
    "loto_request_id" TEXT NOT NULL,
    "card_number" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "equipment_location" TEXT NOT NULL,
    "equipment_info" JSONB NOT NULL,
    "printed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tagging_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "loto_requests_request_number_key" ON "loto_requests"("request_number");

-- CreateIndex
CREATE UNIQUE INDEX "tagging_cards_loto_request_id_key" ON "tagging_cards"("loto_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "tagging_cards_card_number_key" ON "tagging_cards"("card_number");

-- AddForeignKey
ALTER TABLE "loto_requests" ADD CONSTRAINT "loto_requests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_requests" ADD CONSTRAINT "loto_requests_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_approvals" ADD CONSTRAINT "loto_approvals_loto_request_id_fkey" FOREIGN KEY ("loto_request_id") REFERENCES "loto_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_approvals" ADD CONSTRAINT "loto_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_history" ADD CONSTRAINT "loto_history_loto_request_id_fkey" FOREIGN KEY ("loto_request_id") REFERENCES "loto_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_history" ADD CONSTRAINT "loto_history_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_attachments" ADD CONSTRAINT "loto_attachments_loto_request_id_fkey" FOREIGN KEY ("loto_request_id") REFERENCES "loto_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loto_attachments" ADD CONSTRAINT "loto_attachments_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tagging_cards" ADD CONSTRAINT "tagging_cards_loto_request_id_fkey" FOREIGN KEY ("loto_request_id") REFERENCES "loto_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
