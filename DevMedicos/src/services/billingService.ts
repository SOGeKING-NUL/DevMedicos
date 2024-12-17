import axios from 'axios';
import { Bill, BillDetails } from '../types/billing';

export const fetchBills = async (): Promise<Bill[]> => {
  const response = await axios.get('http://localhost:3500/api/bill/getbills');
  return response.data;
};

export const fetchBillDetails = async (billNo: string): Promise<BillDetails> => {
  const response = await axios.get('http://localhost:3500/api/bill/viewdetails', {
    params: { bill_no: billNo }
  });
  return response.data;
};