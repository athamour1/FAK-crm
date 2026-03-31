import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards,
} from '@nestjs/common';
import { KitsService } from './kits.service';
import { CreateKitDto } from './dto/create-kit.dto';
import { UpdateKitDto } from './dto/update-kit.dto';
import { AssignKitDto } from './dto/assign-kit.dto';
import { CreateKitItemDto } from './dto/create-kit-item.dto';
import { UpdateKitItemDto } from './dto/update-kit-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kits')
export class KitsController {
  constructor(private kitsService: KitsService) {}

  // ── Kit CRUD (Admin) ────────────────────────────────────────────────────────

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateKitDto) {
    return this.kitsService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.kitsService.findAll();
  }

  /** Checker: get kits assigned to me */
  @Get('my')
  myKits(@CurrentUser() user: { id: string }) {
    return this.kitsService.findByUser(user.id);
  }

  /** Admin: get any kit; Checker: get their own kit */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.kitsService.assertAccess(id, user);
  }

  /** Admin: update any kit; Checker: update their assigned kit */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKitDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN) return this.kitsService.update(id, dto);
    return this.kitsService.assertAccess(id, user).then(() =>
      this.kitsService.update(id, dto),
    );
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kitsService.remove(id);
  }

  // ── Assignment (Admin only) ─────────────────────────────────────────────────

  @Roles(Role.ADMIN)
  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignKitDto) {
    return this.kitsService.assign(id, dto);
  }

  // ── KitItem management (Admin + assigned Checker) ───────────────────────────

  @Post(':id/items')
  addItem(
    @Param('id') kitId: string,
    @Body() dto: CreateKitItemDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN) return this.kitsService.addItem(kitId, dto);
    return this.kitsService.assertAccess(kitId, user).then(() =>
      this.kitsService.addItem(kitId, dto),
    );
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') kitId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateKitItemDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN)
      return this.kitsService.updateItem(kitId, itemId, dto);
    return this.kitsService.assertAccess(kitId, user).then(() =>
      this.kitsService.updateItem(kitId, itemId, dto),
    );
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') kitId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    if (user.role === Role.ADMIN)
      return this.kitsService.removeItem(kitId, itemId);
    return this.kitsService.assertAccess(kitId, user).then(() =>
      this.kitsService.removeItem(kitId, itemId),
    );
  }
}
