const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const EMAIL_RECEIVER = process.env.EMAIL_RECEIVER;

console.log(GMAIL_USER, GMAIL_PASSWORD)

const dbPath = path.join(__dirname, '..', 'models', 'DevMedicos.db');

const currentDir = __dirname;

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});


let startDate, endDate
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

    // Get the most recent date
    endDate = row.latest_date.split('T')[0]; // Format as YYYY-MM-DD

    // Calculate the start date as 30 days before the most recent date
    startDate = new Date(new Date(endDate) - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // SQL query to fetch bills from the last 30 days (or available data) and the number of items in each bill
    const query = `
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

    // Create a valid filename without time (replace special characters like ":")
    const safeStartDate = startDate.replace(/:/g, '-');
    const safeEndDate = endDate.replace(/:/g, '-');
    
    // Path to save the CSV file in the same directory as the script with both start and end dates
    const outputCsvPath = path.join(currentDir, `bills_${safeStartDate}_to_${safeEndDate}.csv`);

    // Execute the query and export to CSV
    db.all(query, [], async(err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            db.close();
            process.exit(1);
        }

        if (rows.length === 0) {
            console.log('No bills found for the specified date range.');
            db.close();
            return;
        }

        // Sum up the total amount
        const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.amount), 0).toFixed(2);

        // Add the total amount as the last row (for display in CSV)
        rows.push({
            id: 'Total',
            created_on: '',
            bill_no: '',
            items_count: '',
            discount: '',
            amount: totalAmount
        });

        try {
            // Convert rows to CSV format
            const csv = parse(rows);

            // Write the CSV data to a file
            fs.writeFileSync(outputCsvPath, csv);
            console.log(`Exported ${rows.length} bills to ${outputCsvPath}`);
            console.log(`Total Amount: ₹${totalAmount}`);

            // Send the email with the CSV file
            console.log(process.env.GMAIL_USER, process.env.GMAIL_PASSWORD);
            await sendEmail(outputCsvPath);

        } catch (csvError) {
            console.error('Error generating CSV:', csvError.message);
        } finally {
            db.close();
        }
    });
});

// Function to send email with the CSV file as attachment
async function sendEmail(csvFilePath) {

    const endDate_formatted= endDate.split(' ')[0];
    // Create a transporter using the environment variables
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASSWORD,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.GMAIL_USER, // sender address
        to: process.env.EMAIL_RECEIVER, // recipient address
        subject: `Bills Report - ${startDate} to ${endDate}`, // Subject line
        html: `<p>Please find the attached CSV file containing the bills report from <strong>${startDate}</strong> to <strong>${endDate_formatted}</strong>.</p>`,
        attachments: [
            {
                path: csvFilePath, // Attach the CSV file
            },
        ],
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err.message);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

