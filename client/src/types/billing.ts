export interface Bill {
  created_on: string;
  bill_no: string;
  item_count: number;
  amount: number;
}

export interface BillItem {
  item: string;
  quantity: number;
  mrp_per_unit: number;
  total_amount: number;
}

export interface BillDetails {
  items: BillItem[];
  discount: number;
}