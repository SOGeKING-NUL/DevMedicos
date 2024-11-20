import axios from 'axios';

export interface ShipmentData {
  invoice_no: string;
  quantity: number;
  bonus: number;
  pack_of: number;
  item: string;
  mrp: number;
  rate: number;
}

export const saveShipments = async (shipments: ShipmentData[]): Promise<void> => {
  try {
    console.log(shipments)
    await axios.post('http://localhost:3500/api/shipments/addshipments', shipments);
  } catch (error) {
    console.error('Error saving shipments:', error);
    throw error;
  }
};