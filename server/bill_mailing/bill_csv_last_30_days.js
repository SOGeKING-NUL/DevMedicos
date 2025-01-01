const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');
const xlsx = require('xlsx');

const dbPath = path.join(__dirname, '..', 'models', 'DevMedicos.db');
const currentDir = __dirname;

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER;

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

let startDate, endDate;
const latestDateQuery = `
    SELECT MAX(created_on) AS latest_date
    FROM bill
`;

db.get(latestDateQuery, [], (err, row) => {
    if (err) {
        console.error('Error querying for the latest date:', err.message);
        db.close();
        process.exit(1);
    }

    if (!row || !row.latest_date) {
        console.log('No bills found in the database.');
        db.close();
        return;
    }

    endDate = row.latest_date.split('T')[0];
    startDate = new Date(new Date(endDate) - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const billsQuery = `
        SELECT 
            b.id, 
            b.created_on, 
            b.bill_no, 
            COUNT(bi.id) AS items_count, 
            b.discount, 
            b.amount
        FROM 
            bill b
        LEFT JOIN 
            bill_items bi
        ON 
            b.bill_no = bi.bill_no
        WHERE 
            b.created_on BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY 
            b.id, b.created_on, b.bill_no, b.discount, b.amount
        ORDER BY 
            b.created_on DESC;
    `;

    const billItemReturnQuery = `
        SELECT 
            strftime('%Y-%m-%d', created_on) AS created_on, 
            item, 
            units, 
            rate_per_unit,
            (units * rate_per_unit) AS total_amount
        FROM 
            bill_item_return
    `;

    const outputExcelPath = path.join(
        currentDir,
        `bills_${startDate}_to_${endDate.replace(/:/g, '-')}.xlsx`
    );

    db.all(billsQuery, [], (err, bills) => {
        if (err) {
            console.error('Error querying bills:', err.message);
            db.close();
            process.exit(1);
        }

        if (bills.length === 0) {
            console.log('No bills found for the specified date range.');
            db.close();
            return;
        }

        const totalBillAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0).toFixed(2);
        bills.push({
            id: 'Total',
            created_on: '',
            bill_no: '',
            items_count: '',
            discount: '',
            amount: totalBillAmount
        });

        db.all(billItemReturnQuery, [], (err, billItemReturns) => {
            if (err) {
                console.error('Error querying bill item returns:', err.message);
                db.close();
                process.exit(1);
            }

            const totalReturnAmount = billItemReturns.reduce(
                (sum, item) => sum + parseFloat(item.total_amount),
                0
            ).toFixed(2);

            billItemReturns.push({
                created_on: 'Total',
                item: '',
                units: '',
                rate_per_unit: '',
                total_amount: totalReturnAmount
            });

            const finalAmount = (totalBillAmount - totalReturnAmount).toFixed(2);

            const workbook = xlsx.utils.book_new();

            const billsSheet = xlsx.utils.json_to_sheet(bills);
            xlsx.utils.sheet_add_aoa(billsSheet, [
                [''],
                ['Final Amount (Bill Amount - Returns)', finalAmount]
            ], { origin: -1 });
            xlsx.utils.book_append_sheet(workbook, billsSheet, 'Bills');

            const returnsSheet = xlsx.utils.json_to_sheet(billItemReturns);
            xlsx.utils.book_append_sheet(workbook, returnsSheet, 'Bill Item Returns');

            xlsx.writeFile(workbook, outputExcelPath, { bookType: 'xlsx' });
            console.log(`Exported data to ${outputExcelPath}`);

            // Ensure file write is completed before sending email
            setTimeout(() => {
                sendEmail(outputExcelPath);
            }, 1000); // Adding a delay of 1 second

        });
    });
});

async function sendEmail(excelFilePath) {
    const endDateFormatted = endDate.split(' ')[0];

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: GMAIL_USER,
        to: EMAIL_RECEIVER,
        subject: `Bills Report - ${startDate} to ${endDate}`,
        html: `<p>Please find the attached Excel file containing the bills report and returned items from <strong>${startDate}</strong> to <strong>${endDateFormatted}</strong>.</p>`,
        attachments: [
            {
                path: excelFilePath,
            },
        ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err.message);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
