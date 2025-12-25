import { User } from '@entities';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FirebaseTokenGuard } from 'src/libs/auth';
import { CurrentUser } from 'src/libs/auth/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { BuyCustomDto } from './dto/buy-custom.dto';
import { BuyPackDto } from './dto/buy-pack.dto';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(FirebaseTokenGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('/credit-packs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List available credit packs' })
  @ApiOkResponse({ description: 'Credit packs retrieved successfully' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  getCreditPacks() {
    return this.billingService.listPacks();
  }

  @Post('/buy/pack/:packId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment order for a credit pack' })
  @ApiParam({ name: 'packId', description: 'ID of the credit pack to buy' })
  @ApiBody({ type: BuyPackDto })
  @ApiCreatedResponse({ description: 'Payment order created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request or validation error' })
  @ApiNotFoundResponse({ description: 'User or pack not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  buyPack(
    @Param('packId') packId: string,
    @Body() body: BuyPackDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.billingService.buyPack({
      userId: currentUser.id,
      packId,
      currency: body.currency,
      metadata: body.metadata,
    });
  }

  @Post('/buy/custom')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment order for a custom credit amount' })
  @ApiBody({ type: BuyCustomDto })
  @ApiCreatedResponse({ description: 'Payment order created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid request or validation error' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  buyCustom(@Body() body: BuyCustomDto, @CurrentUser() currentUser: User) {
    return this.billingService.buyCustom({
      userId: currentUser.id,
      amount: body.amount,
      currency: body.currency,
      metadata: body.metadata,
    });
  }

  @Get('/verify-order/:orderId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify a payment order and credit user on success',
  })
  @ApiParam({
    name: 'orderId',
    description: 'ID of the payment order to verify',
  })
  @ApiOkResponse({ description: 'Order verified successfully' })
  @ApiBadRequestResponse({
    description: 'Payment verification failed or invalid state',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async verifyOrder(
    @Param('orderId') orderId: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.billingService.verifyAndCredit(orderId, currentUser.id, {});
    return { verified: true };
  }
}
