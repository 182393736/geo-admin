/** 套餐 / 订阅 / 订单 / 积分充值 */
import { get, post } from '../http'
import type { Subscription } from '../types'

export interface PlanItem {
  id: number
  plan_code: string
  plan_name: string
  plan_type: string
  billing_cycle: string
  duration_days: number
  original_price: number
  price: number
  credit_price: number
  discount_rate?: number
  query_limit: number
  platform_list?: string[]
  platform_scope?: string
  features: unknown
  sort: number
  on_sale: boolean
}

export interface PlansGrouped {
  free: PlanItem[]
  starter: PlanItem[]
  basic: PlanItem[]
  pro: PlanItem[]
  custom: PlanItem[]
}

export interface SubscriptionFull extends Subscription {
  status?: string
}

export interface CreditTxn {
  txn_id: string
  type: string
  coin: string
  amount: number
  balance_after?: number
  ref_type?: string
  ref_id?: string
  remark?: string
  title?: string
  created_at: string
}

export interface RechargePack {
  pack_id: number
  credits: number
  price: number
  unit_price: number
}

export interface PayOrderCreated {
  order_no: string
  status: string
  pay_method: string
  plan_code?: string
  plan_name?: string
  plan_type?: string
  price: number
  credit_price?: number
  query_limit?: number
  duration_days?: number
  expire_time?: string
  code_url?: string
  mock_pay?: boolean
  credits?: number
  pack_id?: number
  paid_at?: string
}

export const paymentApi = {
  plansGrouped: () => get<PlansGrouped>('/payment/plans/grouped'),
  subscription: () => get<SubscriptionFull>('/payment/subscription/current'),
  orders: (limit = 20) =>
    get<
      {
        id: string
        order_no: string
        order_category: string
        plan_name: string
        price: number
        pay_amount: number
        status: string
        created_at: string
        paid_at: string | null
      }[]
    >(`/payment/orders?limit=${limit}`),
  createOrder: (body: {
    brand_id?: string
    plan_code: string
    pay_method: 'wx' | 'credit'
    order_type?: string
  }) => post<PayOrderCreated>('/payment/order/create', body),
  getOrder: (orderNo: string) => get<PayOrderCreated>(`/payment/order/${orderNo}`),
  mockPay: (orderNo: string) =>
    post<{ order_no: string; status: string }>(`/payment/order/${orderNo}/mock-pay`),
}

export const creditApi = {
  account: () =>
    get<{
      balance: number
      available: number
      frozen: number
      total_recharge: number
      total_consume: number
      total_expired: number
    }>('/credit/account'),
  transactions: (page = 1, pageSize = 20, type?: string) =>
    get<{ list: CreditTxn[]; total: number; page: number; page_size: number }>(
      `/credit/transactions?page=${page}&page_size=${pageSize}${type && type !== 'all' ? `&type=${type}` : ''}`,
    ),
  packs: () => get<RechargePack[]>('/credit/recharge/packs'),
  createRecharge: (pack_id: number, brand_id?: string) =>
    post<PayOrderCreated>('/credit/recharge/create', { pack_id, brand_id }),
}
