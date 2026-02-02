import { randomUUID } from "crypto";

export function generateBoxId() {
    return "box_" + randomUUID();
}

export function generateShareToken() {
    return "share_" + randomUUID();
}