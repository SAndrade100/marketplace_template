import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string) {
    let total = 0;
    const itemsData: Array<{ productId: string; quantity: number; price: number }> = [];

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(`Product "${product.title}" is not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product "${product.title}". Available: ${product.stock}`,
        );
      }

      const price = Number(product.price);
      total += price * item.quantity;
      itemsData.push({ productId: item.productId, quantity: item.quantity, price });
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          buyerId,
          total,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: { include: { product: { select: { id: true, title: true } } } },
          buyer: { select: { id: true, name: true, email: true } },
        },
      });

      for (const item of createOrderDto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    return order;
  }

  async findAll(userId: string, userRole: string) {
    const where = userRole === Role.ADMIN ? {} : { buyerId: userId };
    return this.prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { id: true, title: true, imageUrl: true } } } },
        buyer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { id: true, title: true, imageUrl: true } } } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (order.buyerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: string,
    userRole: string,
  ) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    if (userRole !== Role.ADMIN && userRole !== Role.SELLER) {
      throw new ForbiddenException('Only admins and sellers can update order status');
    }
    return this.prisma.order.update({
      where: { id },
      data: { status: updateOrderStatusDto.status },
      include: {
        items: { include: { product: { select: { id: true, title: true } } } },
        buyer: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
