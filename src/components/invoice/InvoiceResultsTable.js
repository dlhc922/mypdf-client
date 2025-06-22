import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Box, Collapse, IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';

const mainColumns = [
    { id: 'expand', label: '', minWidth: 20 },
    { id: '来源文件', label: '来源文件', minWidth: 170 },
    { id: '发票代码', label: '发票代码', minWidth: 120 },
    { id: '发票号码', label: '发票号码', minWidth: 150 },
    { id: '开票日期', label: '开票日期', minWidth: 120 },
    { id: '发票类型', label: '发票类型', minWidth: 130 },
    { id: '购买方名称', label: '购买方', minWidth: 170 },
    { id: '销售方名称', label: '销售方', minWidth: 170 },
    { id: '不含税金额', label: '不含税金额', minWidth: 100, align: 'right' },
    { id: '税额', label: '税额', minWidth: 100, align: 'right' },
    { id: '价税合计', label: '价税合计', minWidth: 100, align: 'right' },
];

const subColumns = [
    { id: 'name', label: '商品名称' },
    { id: 'unit', label: '单位' },
    { id: 'quantity', label: '数量', align: 'right' },
    { id: 'unitPrice', label: '单价', align: 'right' },
    { id: 'amount', label: '金额', align: 'right' },
    { id: 'taxRate', label: '税率', align: 'right' },
    { id: 'taxAmount', label: '税额', align: 'right' },
];

const Row = ({ row }) => {
    const [open, setOpen] = useState(false);

    return (
        <React.Fragment>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        disabled={!row['商品信息'] || row['商品信息'].length === 0}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {mainColumns.slice(1).map((column) => (
                    <TableCell key={column.id} align={column.align}>
                        {row[column.id]}
                    </TableCell>
                ))}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={mainColumns.length}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                商品信息
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        {subColumns.map((col) => (
                                            <TableCell key={col.id} align={col.align}>{col.label}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row['商品信息'] && row['商品信息'].map((item, index) => (
                                        <TableRow key={index}>
                                            {subColumns.map((col) => (
                                                <TableCell key={col.id} align={col.align}>
                                                    {item[col.id]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

export const InvoiceResultsTable = () => {
    const { invoiceData } = useInvoiceRecognitionContext();

    if (invoiceData.length === 0) {
        return (
            <Paper sx={{ mt: 2, p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">暂无识别结果</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>识别结果</Typography>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {mainColumns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoiceData.map((row) => (
                            <Row key={row.id || row['来源文件']} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
        </Box>
    );
}; 