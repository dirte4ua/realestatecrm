import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: {
      property: true,
      client: true,
      lead: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const appointment = await prisma.appointment.create({
    data: {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      type: body.type,
      status: body.status,
      propertyId: body.propertyId || null,
      clientId: body.clientId || null,
      leadId: body.leadId || null,
    },
    include: {
      property: true,
      client: true,
      lead: true,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
