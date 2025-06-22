/* ---------- 修复后的 invoicePatterns ---------- */
export const invoicePatterns = {
    invoiceNumber    : /发\s*票\s*号\s*码\s*[:：]?\s*(\d{20})/,
    invoiceDate      : /开\s*票\s*日\s*期\s*[:：]?\s*(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/,
    invoiceType      : /(增值税(?:电子)?(?:专用|普通)发票)/,
    buyerName        : /购\s*买\s*方[\s\S]{0,100}?名\s*称\s*[:：]?\s*([^\n\r]+)/,
    sellerName       : /销\s*售\s*方[\s\S]{0,100}?名\s*称\s*[:：]?\s*([^\n\r]+)/,
    
    // 价税合计 - 匹配 "（小写）" 前面的金额
    // totalAmount      : /[¥￥]\s*([\d,.]+(?:\.\d{2})?)\s*\n?\s*价\s*税\s*合\s*计.*?\(\s*小\s*写\s*\)/,
    // totalAmount: /价\s*税\s*合\s*计\s*\(\s*大\s*写\s*\)[\s\S]*?[¥￥]\s*([\d,.]+\.\d{2})/,
    // totalAmount: /价\s*税\s*合\s*计[\s\S]*?[¥￥]\s*([\d,]+\.\d{2})/,
    //totalAmount: /[¥￥]\s*(\d{1,3}(?:,\d{3})*\.\d{2})\s+价\s*税\s*合\s*计/,
    totalAmount      : /圆\s*整\s+[¥￥]?\s*([\d,.]+\.\d{2})/,
    // 不含税金额和税额 - 需要特殊处理，先匹配整行
    amountWithoutTax : /[¥￥]\s*([\d,.]+(?:\.\d{2})?)\s+[¥￥]/,
    
    // 税额 - 匹配第二个¥后的金额
    taxAmount        : /[¥￥]\s*[\d,.]+(?:\.\d{2})?\s+[¥￥]\s*([\d,.]+(?:\.\d{2})?)/,
};

/* ---------- 解析主函数（保持不变） ---------- */
export const parseText = (text, fileName) => {
    const data = {};
    const normalizedText = text
        .replace(/\u00A0/g, ' ')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\r/g, '')
        .trim();

    console.log('--- 开始解析:', fileName);
    console.log('--- 规范化文本预览:', normalizedText.substring(0, 500));

    /* 逐字段匹配 */
    for (const key in invoicePatterns) {
        const m = normalizedText.match(invoicePatterns[key]);
        if (m) {
            /* 组装日期：m[1]=年 m[2]=月 m[3]=日 */
            if (key === 'invoiceDate' && m.length >= 4) {
                data[key] = `${m[1]}年${m[2]}月${m[3]}日`;
            } else {
                data[key] = m[1].replace(/[,¥￥ ]/g, '').trim();
            }
            console.log(`✅ ${key}:`, data[key]);
        } else {
            console.warn(`⚠️ 未匹配到 ${key}`);
            // 调试：打印相关文本片段
            if (key.includes('Amount') || key.includes('Tax')) {
                const contextMatch = normalizedText.match(/合\s*计[\s\S]{0,100}/);
                console.log('合计上下文:', contextMatch ? contextMatch[0] : '未找到');
            }
        }
    }

    // ◇ 若仍未捕获 totalAmount，则专找 "圆整 / 角整 / 分整 / 分" 行后面的金额
    if (!data.totalAmount) {
        const m = normalizedText.match(
            /(圆\s*整|角\s*整|分(?:\s*整)?)[\s\S]{0,40}?[¥￥]?\s*([\d,.]+\.\d{2})/
        );
        if (m) {
            data.totalAmount = m[2].replace(/[,¥￥ ]/g, '');
            console.log('↳ 圆整/角整/分(整) 兜底提取 totalAmount =', data.totalAmount);
        } else {
            console.warn('❌ 未找到 价税合计(金额)');
        }
    }

    /* ⤵️ 若名称仍为空，尝试左右并排写法 */
    if ((!data.buyerName || !data.sellerName)) {
        const alt = normalizedText.match(/名\s*称\s*[:：]?\s*([^\s]+)\s+名\s*称\s*[:：]?\s*([^\s]+)/);
        if (alt) {
            data.buyerName  = data.buyerName  || alt[1];
            data.sellerName = data.sellerName || alt[2];
            console.log('↳ 并排名称解析成功:', data.buyerName, '|', data.sellerName);
        }
    }

    /* ⤵️ 若仍未捕获 invoiceNumber，再做跨行/前置行搜索 */
    if (!data.invoiceNumber) {
        // 情形 1：20 位数字在标题"上一行"
        let m = normalizedText.match(/(\d{20})\s*(?:\n[^\n]{0,40}?发\s*票\s*号\s*码)/);

        // 情形 2：20 位数字在标题"下一行"
        if (!m) {
            m = normalizedText.match(/发\s*票\s*号\s*码[^\n]{0,40}?\n\s*(\d{20})/);
        }

        if (m) {
            data.invoiceNumber = m[1];
            console.log('↳ 跨行匹配 invoiceNumber =', data.invoiceNumber);
        } else {
            console.warn('❌ 未找到 发票号码(20 位)');
        }
    }

    /* ⤵️ 拆分 20 位票号（10+10 或 12+8） */
    if (data.invoiceNumber?.length === 20) {
        if (/^\d{10}0{0,2}\d{8}$/.test(data.invoiceNumber)) {
            data.invoiceCode   = data.invoiceNumber.slice(0, 12);
            data.invoiceNumber = data.invoiceNumber.slice(12);
        } else {
            data.invoiceCode   = data.invoiceNumber.slice(0, 10);
            data.invoiceNumber = data.invoiceNumber.slice(10);
        }
        console.log('拆分后 code/number:', data.invoiceCode, '/', data.invoiceNumber);
    }

    /* ⤵️ 关键字段校验 */
    const missing = ['invoiceNumber','invoiceDate','buyerName','sellerName']
        .filter(k => !data[k]);
    if (missing.length) {
        console.error('❌ 缺少关键字段:', missing);
        return null;
    }

    /* ⤵️ 商品信息解析 */
    const items = [];
    const itemBlockRegex = /项目名称[\s\S]+?(?=合\s*计)/;
    const itemBlockMatch = text.match(itemBlockRegex);

    if (itemBlockMatch) {
        const itemBlock = itemBlockMatch[0];
        // 1. 将整个商品块按每个商品的起始"*"进行切分
        const entries = itemBlock.split(/\n(?=\s*\*)/);

        for (const entry of entries) {
            // 使用分步解析，而不是单个复杂正则
            const item = {};
            const flattenedEntry = entry.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
            
            // 2. 定位并解析核心数据行 (包含税率的那部分)
            const coreRegex = /(?<unit>[\u4e00-\u9fa5]{1,3})\s+(?<numbers>[\d\.\s]+?)\s+(?<taxRate>\d+%)\s+(?<taxAmount>[\d\.]+)/;
            const coreMatch = flattenedEntry.match(coreRegex);

            if (coreMatch) {
                const gCore = coreMatch.groups;
                item.taxRate = gCore.taxRate;
                item.taxAmount = parseFloat(gCore.taxAmount) || 0;
                item.unit = gCore.unit;
                
                // 解析数量、单价、金额
                const numArr = gCore.numbers.trim().split(/\s+/);
                if (numArr.length >= 2) {
                    item.quantity = parseFloat(numArr[0]) || 0;
                    if (numArr.length === 3) {
                        item.unitPrice = parseFloat(numArr[1]) || '0.00';
                        item.amount = parseFloat(numArr[2]) || 0;
                    } else {
                        item.amount = parseFloat(numArr[1]) || 0;
                    }
                }

                // 3. 解析商品名称和可能的单价
                const namePart = flattenedEntry.substring(0, coreMatch.index);
                const nameRegex = /\*\s*(?<name>[\s\S]*?)\s*(?<uprice>[\d\.]+)?\s*$/;
                const nameMatch = namePart.match(nameRegex);
                if (nameMatch) {
                    item.name = nameMatch.groups.name;
                    // 如果在名称部分找到了单价，用它覆盖
                    if (nameMatch.groups.uprice) {
                        item.unitPrice = parseFloat(nameMatch.groups.uprice) || '0.00';
                    }
                }

                // 确保有默认值
                item.unitPrice = item.unitPrice || '0.00';
                
                if (item.name && item.quantity && item.amount) {
                    items.push(item);
                }
            }
        }
    }

    const result = {
        '发票代码'   : data.invoiceCode   || 'N/A',
        '发票号码'   : data.invoiceNumber || 'N/A',
        '开票日期'   : data.invoiceDate   || 'N/A',
        '发票类型'   : data.invoiceType   || '电子普通发票',
        '购买方名称' : data.buyerName     || 'N/A',
        '销售方名称' : data.sellerName    || 'N/A',
        '价税合计'   : data.totalAmount   || '0.00',
        '不含税金额' : data.amountWithoutTax || '0.00',
        '税额'       : data.taxAmount     || '0.00',
        '商品信息'   : items,
        '来源文件'   : fileName,
    };
    console.log('✅ 最终结果:', result);
    return result;
};