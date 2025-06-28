const barcode = "01078983574100151723031531020500003922001545";


const parseGS1Barcode = (barcode) =>{
    const aiPatterns = {
        "01": { length: 14, label: "GTIN" },
        "17": { length: 6, label: "Validade" },
        "10": { length: "var", label: "Lote" }, 
        "00": { length: 18, label: "SSCC" },
        "310": { length: 6, label: "Peso", decimal: true },
        "392": { length: "var", label: "Preço", decimal: true }
    };

    let result = {};
    let i = 0;

    while (i < barcode.length) {
        let ai = barcode.substring(i, i + 2);

        // Verifica AI de 4 dígitos (310n e 392n)
        if (ai === "31" || ai === "39") {
            ai = barcode.substring(i, i + 4);
        }
console.log()
        console.log("ai.substring(0, 3) =",ai.substring(0, 3))
        let info = aiPatterns[ai.substring(0, 3)];

        if (!info) {
            i++;
            continue;
        }

        let length = info.length;
        let value = "";

        console.log("ai = ", ai)
        console.log("length = ", length)
        if (length === "var") {
            let endIndex = barcode.indexOf("\u001D", i + ai.length);
            if (endIndex === -1) endIndex = barcode.length;
            value = barcode.substring(i + ai.length, endIndex);
            i = endIndex;
        } else {
            value = barcode.substring(i + ai.length, i + ai.length + length);
            i += ai.length + length;
        }
        
        // Ajusta valores para peso e preço
        if (info.decimal) {
            console.log("value = ", value)
            let decimalPlaces = parseInt(ai[3]);
            const result1 = value
            let numericValue = parseFloat(result1) / Math.pow(10, decimalPlaces);
            result[info.label] = numericValue.toFixed(decimalPlaces);
        } else {
            result[info.label] = value;
        }
    }

    return result;
}

// Exemplo de uso

console.log(parseGS1Barcode(barcode));