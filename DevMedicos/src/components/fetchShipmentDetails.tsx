import axios from 'axios';

export interface ShipmentDetail {
  id: string;
  date: string;
  invoiceId: string;
  totalAmount: number;
  itemCount: number;
}

export const fetchShipmentDetails = async (): Promise<ShipmentDetail[]> => {
  try {
    // Fetch all invoice numbers
    const invoiceResponse = await axios.get('http://localhost:3500/api/shipments/invoice_number');
    const invoiceNumbers = invoiceResponse.data;

    // Fetch details for each invoice number
    const shipmentDetails = await Promise.all(
      invoiceNumbers.map(async (invoiceNo: string) => {
        try {
          // Fetch date
          const dateResponse = await axios.get('http://localhost:3500/api/shipments/shipment_date', {
            params: { invoice_no: invoiceNo }
          });

          // Fetch total amount
          const amountResponse = await axios.get('http://localhost:3500/api/shipments/shipment_amount', {
            params: { invoice_no: invoiceNo }
          });

          // Fetch item count
          const countResponse = await axios.get('http://localhost:3500/api/shipments/item_count', {
            params: { invoice_no: invoiceNo }
          });

          return {
            id: invoiceNo, // Using invoice number as ID
            date: dateResponse.data.created_on,
            invoiceId: invoiceNo,
            totalAmount: amountResponse.data.sum,
            itemCount: countResponse.data.item_count
          };
        } catch (error) {
          console.error(`Error fetching details for invoice ${invoiceNo}:`, error);
          throw error;
        }
      })
    );

    return shipmentDetails;
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    throw error;
  }
};