import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    return this.prisma.product.create({
      data: { ...createProductDto, sellerId },
      include: { seller: { select: { id: true, name: true } }, category: true },
    });
  }

  async findAll(filterDto: FilterProductDto) {
    const { categoryId, sellerId, minPrice, maxPrice, search, page = 1, limit = 10 } = filterDto;

    const where: any = { isActive: true };

    if (categoryId) where.categoryId = categoryId;
    if (sellerId) where.sellerId = sellerId;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { seller: { select: { id: true, name: true } }, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true } }, category: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string, userRole: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own products');
    }
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { seller: { select: { id: true, name: true } }, category: true },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own products');
    }
    return this.prisma.product.delete({ where: { id } });
  }
}
