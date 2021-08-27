import { response } from 'express'
import { createTransport } from 'nodemailer'

export const sendMonthlyEmails = () => {
    const Excel = require('exceljs')
    const filename = 'Debtors.xlsx'
    let workbook = new Excel.Workbook()
    let worksheet = workbook.addWorksheet('Debtors')
    worksheet.columns = [
        { header: 'First Name', key: 'firstName' },
        { header: 'Last Name', key: 'lastName' },
        { header: 'Purchase Price', key: 'purchasePrice' },
        { header: 'Payments Made', key: 'paymentsMade' },
    ]
    let data = [
        {
            firstName: 'John',
            lastName: 'Bailey',
            purchasePrice: 1000,
            paymentsMade: 100,
        },
        {
            firstName: 'Leonard',
            lastName: 'Clark',
            purchasePrice: 1000,
            paymentsMade: 150,
        },
    ]
    data.forEach((e) => {
        worksheet.addRow(e)
    })
    const buffer = await workbook.xlsx.writeBuffer()
    const transporter = nodemailer.createTransport({
        host: 'altocinema.com',
        port: 465,
        secure: true,
        auth: {
            user: 'contact@altocinema.com',
            pass: 'Altocine2020',
        },
    })
    const mailOptions = {
        from: 'info@altocinema.com',
        to: ['ignacio_domingo@outlook.com'],
        subject: 'TEST EMAIL',
        html: 'content',
        attachments: [
            {
                filename,
                content: buffer,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return err
        else return info
    })
}
