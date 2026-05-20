import { NextResponse } from "next/server";
import { deleteByIdForWallet } from "@/lib/repos/research-sessions";
import { verifyJwt } from "@/lib/siwe";

function parseCookie(req: Request, name: string): string | null {
  const c = req.headers.get("cookie");
  if (!c) return null;
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const jwt = parseCookie(req, "pyxis_session");
  const wallet = jwt ? verifyJwt(jwt) : null;
  if (!wallet)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteByIdForWallet(id, wallet);
  if (!deleted)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true, id });
}
