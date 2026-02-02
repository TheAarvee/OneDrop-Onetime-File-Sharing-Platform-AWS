import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/backend/auth/verifyFirebaseToken";
import { deleteBox } from "@/backend/services/dynamodb.service";

// DELETE /api/boxes/[boxId] - Delete a box
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ boxId: string }> }
) {
    const authHeader = request.headers.get("authorization");
    const ownerId = await verifyFirebaseToken(authHeader || "");
    if (!ownerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boxId } = await params;
    await deleteBox(ownerId, boxId);
    return NextResponse.json({ message: "Box deleted successfully" });
}
