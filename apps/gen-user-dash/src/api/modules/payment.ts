/** 套餐 / 订阅 / 订单（采集前真实展示：套餐页） */
import { get } from '../http';
import type { Subscription } from '../types';

export interface PlanItem {
  id: number; plan_code: string; plan_name: string; plan_type: string;
  billing_cycle: string; duration_days: number;
  original_price: number; price: number; query_limit: number;
  features: unknown; sort: number; on_sale: boolean;
}

export interface PlansGrouped {
  free: PlanItem[]; starter: PlanItem[]; pro: PlanItem[]; custom: PlanItem[];
}

export interface SubscriptionFull extends Subscription { status?: string }

export const paymentApi = {
  plansGrouped: () => get<PlansGrouped>('/payment/plans/grouped'),
  subscription: () => get<SubscriptionFull>('/payment/subscription/current'),
  orders: (limit = 20) => get<{ id: string; order_no: string; order_category: string; plan_name: string; price: number; pay_amount: number; status: string; created_at: string; paid_at: string | null }[]>(`/payment/orders?limit=${limit}`),
};
