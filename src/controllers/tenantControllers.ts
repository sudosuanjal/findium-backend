import { PrismaClient } from "@prisma/client/extension";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "tenant not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: `server error while retreving tenant: &{error.message}`,
      });
  }
};
