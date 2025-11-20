import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const leads = await prisma.lead.findMany();
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const lead = await prisma.lead.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      status: body.status,
      source: body.source,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
