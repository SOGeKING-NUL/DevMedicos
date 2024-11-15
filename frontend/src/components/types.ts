export interface ShipmentItem {
  invoiceNo: string;
  item: string;
  quantity: number;
  bonus: number | null;
  packOf: number;
  mrp: number;
  rate: number;
  amount: number;
}

export interface Shipment {
  id: number;
  createdOn: string;
  items: ShipmentItem[];
}

export interface ValidationErrors {
  [key: string]: string;
}