import { useInvoiceRecognitionContext } from '../../contexts/InvoiceRecognitionContext';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import Tesseract from 'tesseract.js';
import { parseText } from './invoicePatterns';
import { useState } from 'react';
import * as XLSX from 'xlsx';

// Setup worker path for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
).toString();

export const useInvoiceRecognition = () => {
    const {
        files,
        invoiceData,
        setInvoiceData,
        status,
        setStatus,
        setProgress,
        updateFileStatus,
        updateFileProgress,
        resetState,
    } = useInvoiceRecognitionContext();

    const isProcessing = status === 'processing';

    const processInvoices = async () => {
        console.log('--- Invoice Processing Started ---');
        setStatus('processing');
        setProgress(0);
        setInvoiceData([]);

        let processedCount = 0;

        for (const fileObj of files) {
            updateFileStatus(fileObj.file.name, 'processing');
            let parsedData = null;

            try {
                const arrayBuffer = await fileObj.file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

                // Attempt 1: Direct Text Extraction
                console.log(`[File] Processing: ${fileObj.file.name}`);
                console.log('[Attempt 1] Starting direct text extraction...');
                for (let i = 1; i <= pdf.numPages && !parsedData; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    const lines = new Map();
                    textContent.items.forEach(item => {
                        const y = Math.round(item.transform[5]);
                        if (!lines.has(y)) {
                            lines.set(y, []);
                        }
                        lines.get(y).push({ str: item.str, x: item.transform[4] });
                    });

                    const sortedLines = [...lines.entries()]
                        .sort((a, b) => b[0] - a[0])
                        .map(entry => entry[1].sort((a,b) => a.x - b.x).map(item => item.str).join(' '));
                    
                    const fullText = sortedLines.join('\n');
                    console.log(`[Log] Full text from direct extraction (Page ${i}):\n${fullText}`);
                    parsedData = parseText(fullText, fileObj.file.name);
                }

                if (parsedData) {
                    console.log(`[Success] Direct text extraction successful for ${fileObj.file.name}`);
                } else {
                    // Attempt 2: OCR Fallback
                    console.log('[Info] Direct extraction failed. Falling back to OCR.');
                    const worker = await Tesseract.createWorker('chi_sim', 1, {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                updateFileProgress(fileObj.file.name, Math.round(m.progress * 100));
                            }
                        }
                    });

                    for (let i = 1; i <= pdf.numPages && !parsedData; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        const context = canvas.getContext('2d');
                        await page.render({ canvasContext: context, viewport }).promise;
                        
                        const { data: { text } } = await worker.recognize(canvas);
                        console.log(`[Log] Full text from OCR (Page ${i}):\n${text}`);
                        parsedData = parseText(text, fileObj.file.name);
                    }
                    await worker.terminate();

                    if (parsedData) {
                        console.log(`[Success] OCR successful for ${fileObj.file.name}`);
                    }
                }

                if (parsedData) {
                    setInvoiceData(prev => [...prev, { ...parsedData, id: fileObj.file.name }]);
                    updateFileStatus(fileObj.file.name, 'success');
                } else {
                    console.log(`[Failure] Could not parse data for ${fileObj.file.name}`);
                    updateFileStatus(fileObj.file.name, 'failure');
                }

            } catch (error) {
                console.error(`Error processing file ${fileObj.file.name}:`, error);
                updateFileStatus(fileObj.file.name, 'failure');
            }

            processedCount++;
            setProgress(Math.round((processedCount / files.length) * 100));
        }

        console.log('--- Invoice Processing Finished ---');
        setStatus('finished');
    };

    const exportToExcel = () => {
        if (!invoiceData || invoiceData.length === 0) return;

        const numericKeys = ['不含税金额', '税额', '价税合计'];

        const rows = invoiceData.map(row => {
            const { '商品信息': _omit, ...summary } = row;

            numericKeys.forEach(key => {
                if (summary[key] !== undefined) {
                    const n = parseFloat(
                        String(summary[key])
                            .replace(/[￥¥,，\s]/g, '')
                    );
                    if (!Number.isNaN(n)) summary[key] = n;
                }
            });
            return summary;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, '汇总');
        XLSX.writeFile(wb, `发票汇总_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    const reset = () => resetState();

    return { processInvoices, isProcessing, exportToExcel, reset };
};