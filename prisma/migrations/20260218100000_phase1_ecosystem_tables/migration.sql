-- CreateEnum
CREATE TYPE "Division" AS ENUM ('ACADEMY', 'PROVISIONS', 'SPORTSWEAR', 'PROJU');

-- CreateTable
CREATE TABLE "academy_products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "stripe_price_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_slug" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" JSONB,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "academy_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provisions_products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provisions_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sportswear_products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_cents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sportswear_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sportswear_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT,
    "total_cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripe_session_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sportswear_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sportswear_order_lines" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_cents" INTEGER NOT NULL,

    CONSTRAINT "sportswear_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_listings" (
    "id" TEXT NOT NULL,
    "farmer_id" UUID NOT NULL,
    "crop" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farm_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academy_products_slug_key" ON "academy_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "academy_enrollments_user_id_product_slug_key" ON "academy_enrollments"("user_id", "product_slug");

-- CreateIndex
CREATE INDEX "academy_enrollments_user_id_idx" ON "academy_enrollments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "provisions_products_slug_key" ON "provisions_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sportswear_products_slug_key" ON "sportswear_products"("slug");

-- CreateIndex
CREATE INDEX "farm_listings_farmer_id_idx" ON "farm_listings"("farmer_id");

-- CreateIndex
CREATE INDEX "farm_listings_status_idx" ON "farm_listings"("status");

-- AddForeignKey
ALTER TABLE "sportswear_order_lines" ADD CONSTRAINT "sportswear_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "sportswear_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sportswear_order_lines" ADD CONSTRAINT "sportswear_order_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "sportswear_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_listings" ADD CONSTRAINT "farm_listings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
