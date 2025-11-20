import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const properties = await prisma.property.findMany();
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const property = await prisma.property.create({
    data: {
      title: body.title,
      description: body.description,
      price: body.price,
      address: body.address,
      city: body.city,
      status: body.status || "available",
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      sqft: body.sqft,
    },
  });
  
  return NextResponse.json(property, { status: 201 });
}
