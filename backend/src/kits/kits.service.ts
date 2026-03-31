import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { AssignKitDto } from './dto/assign-kit.dto';
import { CreateKitItemDto } from './dto/create-kit-item.dto';
import { UpdateKitItemDto } from './dto/update-kit-item.dto';
import { Role } from '@prisma/client';

/** Adds the virtual `isValid` field to a KitItem. */
function withIsValid<T extends { expirationDate: Date | null }>(item: T) {
  return {
    ...item,
    isValid: item.expirationDate === null || item.expirationDate > new Date(),
  };
}

const KIT_INCLUDE = {
  assignees: { select: { id: true, fullName: true, email: true } },
  kitItems: {
    orderBy: { name: 'asc' } as const,
  },
};

@Injectable()
export class KitsService {
  constructor(private prisma: PrismaService) {}

  // ── Kit CRUD ────────────────────────────────────────────────────────────────

  create(dto: CreateKitDto) {
    return this.prisma.kit.create({ data: dto, include: KIT_INCLUDE });
  }

  async findAll() {
    const kits = await this.prisma.kit.findMany({
      include: KIT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return kits.map((k) => ({ ...k, kitItems: k.kitItems.map(withIsValid) }));
  }

  async findOne(id: string) {
    const kit = await this.prisma.kit.findUnique({ where: { id }, include: KIT_INCLUDE });
    if (!kit) throw new NotFoundException('Kit not found');
    return { ...kit, kitItems: kit.kitItems.map(withIsValid) };
  }

  async findByUser(userId: string) {
    const kits = await this.prisma.kit.findMany({
      where: { assignees: { some: { id: userId } }, isActive: true },
      include: KIT_INCLUDE,
      orderBy: { name: 'asc' },
    });
    return kits.map((k) => ({ ...k, kitItems: k.kitItems.map(withIsValid) }));
  }

  async update(id: string, dto: UpdateKitDto) {
    await this.findOne(id);
    return this.prisma.kit.update({ where: { id }, data: dto, include: KIT_INCLUDE });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.kit.delete({ where: { id } });
  }

  // ── Kit Assignment ──────────────────────────────────────────────────────────

  async assign(id: string, dto: AssignKitDto) {
    await this.findOne(id);
    return this.prisma.kit.update({
      where: { id },
      data: { assignees: { set: dto.userIds.map((uid) => ({ id: uid })) } },
      include: KIT_INCLUDE,
    });
  }

  // ── KitItem management ─────────────────────────────────────────────────────

  async addItem(kitId: string, dto: CreateKitItemDto) {
    await this.findOne(kitId);
    const item = await this.prisma.kitItem.create({
      data: {
        kitId,
        name: dto.name,
        ...(dto.category    && { category:       dto.category }),
        ...(dto.unit        && { unit:            dto.unit }),
        quantity:      dto.quantity,
        ...(dto.locationInKit  && { locationInKit:  dto.locationInKit }),
        ...(dto.expirationDate && { expirationDate: new Date(dto.expirationDate) }),
        ...(dto.notes          && { notes:          dto.notes }),
      },
    });
    return withIsValid(item);
  }

  async updateItem(kitId: string, itemId: string, dto: UpdateKitItemDto) {
    const item = await this.prisma.kitItem.findFirst({ where: { id: itemId, kitId } });
    if (!item) throw new NotFoundException('Kit item not found');

    const updated = await this.prisma.kitItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name         !== undefined && { name:         dto.name }),
        ...(dto.category     !== undefined && { category:     dto.category }),
        ...(dto.unit         !== undefined && { unit:         dto.unit }),
        ...(dto.quantity     !== undefined && { quantity:     dto.quantity }),
        ...(dto.locationInKit !== undefined && { locationInKit: dto.locationInKit }),
        ...(dto.notes        !== undefined && { notes:        dto.notes }),
        ...(dto.expirationDate !== undefined && {
          expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        }),
      },
    });
    return withIsValid(updated);
  }

  async removeItem(kitId: string, itemId: string) {
    const item = await this.prisma.kitItem.findFirst({ where: { id: itemId, kitId } });
    if (!item) throw new NotFoundException('Kit item not found');
    return this.prisma.$transaction([
      this.prisma.inspectionLogItem.deleteMany({ where: { kitItemId: itemId } }),
      this.prisma.kitItem.delete({ where: { id: itemId } }),
    ]);
  }

  // ── Authorization helper ────────────────────────────────────────────────────

  async assertAccess(kitId: string, user: { id: string; role: string }) {
    const kit = await this.findOne(kitId);
    if (user.role === Role.ADMIN) return kit;
    if (!kit.assignees.some((a) => a.id === user.id))
      throw new ForbiddenException('You do not have access to this kit');
    return kit;
  }
}
