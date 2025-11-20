import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.property.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Property deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const property = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        price: parseFloat(body.price),
        address: body.address,
        city: body.city,
        status: body.status,
        bedrooms: parseInt(body.bedrooms),
        bathrooms: parseFloat(body.bathrooms),
        sqft: parseFloat(body.sqft),
      },
    });

    return NextResponse.json(property, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
