-- AlterTable
ALTER TABLE "loto_requests" ADD COLUMN     "asset_id" TEXT;

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "asset_number" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "equipment_type" TEXT,
    "location" TEXT,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_asset_number_key" ON "assets"("asset_number");

-- CreateIndex
CREATE INDEX "assets_unit_idx" ON "assets"("unit");

-- CreateIndex
CREATE INDEX "assets_equipment_name_idx" ON "assets"("equipment_name");

-- AddForeignKey
ALTER TABLE "loto_requests" ADD CONSTRAINT "loto_requests_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
