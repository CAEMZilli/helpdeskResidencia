import { prisma } from "../config/db";
import type { CatServicios, Prisma } from "@prisma/client";

type CatServiceWithTickets = Prisma.CatServiciosGetPayload<{
  include: { tickets: true };
}>;

export const createCatService = async (
  data: Prisma.CatServiciosCreateInput
): Promise<CatServicios> => {
  const newCatService = await prisma.catServicios.create({ data });
  return newCatService;
};

export const getAllCatServices = async (): Promise<CatServiceWithTickets[]> => {
  const services = await prisma.catServicios.findMany({
    include: {
      tickets: true,
    },
  });

  return services;
};

export const getCatServiceById = async (
  id: string
): Promise<CatServiceWithTickets | null> => {
  const service = await prisma.catServicios.findUnique({
    where: { id },
    include: {
      tickets: true,
    },
  });

  return service;
};

export const updateCatService = async (
  id: string,
  data: Prisma.CatServiciosUpdateInput
): Promise<CatServicios> => {
  const updatedService = await prisma.catServicios.update({
    where: { id },
    data,
  });

  return updatedService;
};

export const deleteCatService = async (id: string): Promise<CatServicios> => {
  const deletedService = await prisma.catServicios.delete({
    where: { id },
  });

  return deletedService;
};