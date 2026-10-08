import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../prisma.js";

export interface StoreReservationRequest {
  storeId: string;
  variantId: string;
  quantity: number;
}

export type StoreReservationResult =
  | {
      ok: true;
      reservations: Array<{ storeId: string; variantId: string; quantity: number }>;
    }
  | {
      ok: false;
      code: "OUT_OF_STOCK";
      storeId: string;
      variantId: string;
      available: number;
      requested: number;
    };

interface LockedInventory {
  id: string;
  stockQuantity: number;
  reservedQuantity: number;
}

/**
 * Atomically reserves existing store inventory rows for a future checkout.
 * This function is not wired into the current SQLite storefront or checkout.
 * Call it only after the application has been migrated to PostgreSQL.
 *
 * Rows are locked in a stable order to reduce deadlocks when orders contain
 * multiple variants. The FOR UPDATE lock is the concurrency guarantee; Redis
 * is not used. A failed availability check returns before any row is updated.
 */
export async function reserveStoreInventory(
  requests: StoreReservationRequest[],
): Promise<StoreReservationResult> {
  if (requests.length === 0) {
    return { ok: true, reservations: [] };
  }

  const combined = new Map<string, StoreReservationRequest>();
  for (const request of requests) {
    if (!Number.isSafeInteger(request.quantity) || request.quantity <= 0) {
      throw new RangeError("Reservation quantities must be positive integers.");
    }
    const key = `${request.storeId}:${request.variantId}`;
    const existing = combined.get(key);
    combined.set(key, {
      storeId: request.storeId,
      variantId: request.variantId,
      quantity: request.quantity + (existing?.quantity ?? 0),
    });
  }

  const normalized = [...combined.values()].sort(
    (left, right) =>
      left.storeId.localeCompare(right.storeId) ||
      left.variantId.localeCompare(right.variantId),
  );

  return prisma.$transaction(async (transaction) => {
    const lockedRows: Array<{
      request: StoreReservationRequest;
      inventory: LockedInventory | null;
    }> = [];

    for (const request of normalized) {
      const rows = await transaction.$queryRaw<LockedInventory[]>(Prisma.sql`
        SELECT "id", "stock_quantity" AS "stockQuantity",
               "reserved_quantity" AS "reservedQuantity"
        FROM "store_inventory"
        WHERE "store_id" = ${request.storeId}::uuid
          AND "variant_id" = ${request.variantId}::uuid
        FOR UPDATE
      `);
      const inventory = rows[0] ?? null;
      const available = inventory
        ? inventory.stockQuantity - inventory.reservedQuantity
        : 0;

      if (!inventory || available < request.quantity) {
        return {
          ok: false,
          code: "OUT_OF_STOCK",
          storeId: request.storeId,
          variantId: request.variantId,
          available,
          requested: request.quantity,
        };
      }

      lockedRows.push({ request, inventory });
    }

    for (const { request, inventory } of lockedRows) {
      if (!inventory) {
        throw new Error("Inventory row disappeared while holding its lock.");
      }
      await transaction.$executeRaw(Prisma.sql`
        UPDATE "store_inventory"
        SET "reserved_quantity" = "reserved_quantity" + ${request.quantity},
            "updated_at" = NOW()
        WHERE "id" = ${inventory.id}::uuid
      `);
    }

    return {
      ok: true,
      reservations: normalized.map(({ storeId, variantId, quantity }) => ({
        storeId,
        variantId,
        quantity,
      })),
    };
  });
}
