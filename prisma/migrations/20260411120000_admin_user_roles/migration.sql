-- Bornfidis platform admin roles (founder_admin | manager | staff)

CREATE TYPE "public"."AppRole" AS ENUM ('founder_admin', 'manager', 'staff');

CREATE TABLE "public"."admin_user_roles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."AppRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_user_roles_email_key" ON "public"."admin_user_roles"("email");
