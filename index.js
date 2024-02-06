const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require("body-parser");
const multer = require('multer');
const Tesseract= require('tesseract.js');
const isimler  = require('./isimler');
const { createWorker } = require('tesseract.js');


const app = express();
app.use(cors());
const port = 8383;
app.use(bodyParser.json());
const worker = createWorker();
app.use(express.json());


// Multer setup
const storage = multer.memoryStorage(); // You can customize the storage as needed
const upload = multer({ storage: storage });

const config = {
    lang: "en",
    oem: 1,
    psm: 3,

  }
  const img = "https://tesseract.projectnaptha.com/img/eng_bw.png"


  function determineBillType(inputArray, typesObject) {
    return new Promise(resolve => {
      const lowercaseInputArray = inputArray.map(item => item.toLowerCase());
      const keywordSetTyped = {};
  
      for (const type in typesObject) {
        const typeValues = typesObject[type].arr.map(item => item.toLowerCase());
        keywordSetTyped[type] = [];
  
        lowercaseInputArray.forEach(item => {
          typeValues.forEach(s => {
            if (item.includes(s) && !keywordSetTyped[type].includes(s)) {
              keywordSetTyped[type].push(s);
            }
          });
        });
  
        const limit = typesObject[type].limit;
        const uniqueKeywordCount = keywordSetTyped[type].length;
  
  
        if (uniqueKeywordCount >= limit) {
          resolve({ type });
        }
      }
  
      resolve({ type: "başka" });
    });
  };

  const parameterObjectForFis={
    ETTN:{
        possible:[['ETTN']],
        checkForNumber:false,
        subtractPossibilities:true,
        proceed:true,
        label:"ETTN",
    },
    Fatura_No:{
        possible:[
            ["FİŞ.","FİS","fiş",".No"],
        ],
        checkForNumber:false,
        subtractPossibilities:true,
        proceed:true,
        label:"Fatura_No",
        length:[20,30],
        trimStart:false

        
    },
    Fatura_Tarihi:{
        possible:[['TARİH']],
        checkForNumber:false,
        subtractPossibilities:true,
        proceed:true,
        label:"Fatura_Tarihi",
    },
    Fatura_Türü:{
        possible:[['Fatura',],["Tür","tür"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Fatura_Türü",
    },
    Fatura_Tipi:{
        possible:[['Fatura'],["Tipi","tip","tipi"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Fatura_Tipi",
    },
    Senaryo:{
        possible:[['SENARYO',"Senaryo"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Senaryo",
    },
    Cari_Vkn_Tckn:{
        possible:[
          ['VKN',"TCKN","Vkn","Tckn","VKN/TC","VD","V.N.","V.D."],
          //["Numarası"]
        ],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Cari_Vkn_Tckn",
        length:[11,10]
    }, 
    Hizmet_Toplam_Tutar:{
        possible:[['Toplam',"NAKİT","TOP"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Hizmet_Toplam_Tutar",
    }, 
    Genel_Toplam:{
        possible:[['Toplam',"NAKİT","TOP"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Genel_Toplam",
    }
}
  const parameterObject={
    ETTN:{
        possible:[['ETTN']],
        checkForNumber:false,
        subtractPossibilities:true,
        proceed:true,
        label:"ETTN",
        clearify:true,
    },
    Fatura_No:{
        possible:[
            ["FİŞ.","FİS","fiş",".No"],
        ],
        checkForNumber:true,
        subtractPossibilities:true,
        proceed:true,
        label:"Fatura_No",
        length:[11,10],
        trimStart:true

        
    },
    Fatura_Tarihi:{
        possible:[['TARİH']],
        checkForNumber:false,
        subtractPossibilities:true,
        proceed:true,
        label:"Fatura_Tarihi",
    },
    Fatura_Türü:{
        possible:[['Fatura',],["Tür","tür"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Fatura_Türü",
    },
    Fatura_Tipi:{
        possible:[['Fatura'],["Tipi","tip","tipi"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Fatura_Tipi",
    },
    Senaryo:{
        possible:[['SENARYO',"Senaryo"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:false,
        label:"Senaryo",
    },
    Cari_Vkn_Tckn:{
        possible:[
          ['VKN',"TCKN","Vkn","Tckn","VKN/TC","VD"],
          //["Numarası"]
        ],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Cari_Vkn_Tckn",
        length:[11,10]
    }, 
    Hizmet_Toplam_Tutar:{
        possible:[['Toplam',"NAKİT","TOP"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Hizmet_Toplam_Tutar",
    }, 
    Genel_Toplam:{
        possible:[['Toplam',"NAKİT","TOP"]],
        subtractPossibilities:true,
        proceed:true,
        checkForNumber:true,
        label:"Genel_Toplam",
    }
}
  const firmNameArray = [
    'Ticaret',
    'Tic', 
    'Sanayi',"LTD","ŞTİ","STI","Limited","ltd",".şti","AŞ.","A.Ş.","A.Ş","Sistemleri", "Şirketi"];

  const allPossible=[
    'özelleştirme', 
    'sayin', 
    "vkn",
    'senaryo',
    'TEMELFATURA',
    'Fatura',
    'tipi',
    'iade',
    'geçici',
    'proforma',
    'irsaliye',
    'tarihi',
    'müşteri', 
    'odeme',
    'gün', 
    'ındirimsiz',
    'yalnız',
    'merkezi',
    'mh.',
    'sok.',
    'sokak',
    'türkiye',
    'e-posta',
    '@',
    'vergi', 
    'daire',
    'numara',
    'web',
    'sitesi',
    'www.',
    '.com',
    '.tr',
    'sicil',
    'mersis',
    'işletme',
    'merkez',
    'sayın',
    'san.',
    'tic',
    'tıc',
    'ltd',
    'sti',
    'e-FATURA',
    'qrcode',
    'ETTN',
    'toplam',
    'hesaplanan',
    'genel',
    'özelleştirme',
    'işlem',
    'ödeme Türü',
    'vadeli',
    'bakiye',
    'alacak',
    'masraf',
    'fax',
    'giriş',
    'komisyon',
    'navlun',
    "IBAN",
    "ticaret",
    "limited",
    "LİMİTED",
    "TİCARET",
    "MAH",
    "YOLU",
    "SOK",
    "TR1.2",
    "şirketi",
    "sirketi",
    "KDV",
    "hesabı",
    "NAK.",
    "Logo",
    "PAZ.",
    "Company",
    "Düzenleme",
    "Zamanı",
    "Kodu",
    "Gerçek",
    "usülde",
    "Yekün",
    "Mersis No:",
    "GARANTİ",
    "EMLAK KATILIM",
    "TÜRKİYE İŞ BANKASI",
    "#",
    "tevkifat"
  
    ]
    const bankalar=[
      "adabank",
      "akbank",
      "alternatifbank",
      "anadolubank",
      "arap türk bankası",
      "ban of china turkey",
      "burgan bank",
      "citibank",
      "denizbank",
      "deutsche bank",
      "fibabanka",
      "habib bank limited istanbul türkiye merkez şubesi",
      "hsbc bank",
      "icbc turkey bank",
      "ing bank",
      "intesa sanpaolo s.p.a.",
      "jp morgan chase bank national association",
      "mufg bank turkey",
      "odea bank",
      "qnb finansbank",
      "rabobank",
      "societe generale",
      "şekerbank",
      "t.c. ziraat bankası",
      "turkish bank",
      "turkland bank",
      "türk ekonomi bankası",
      "türk ticaret bankası",
      "türkiye garanti bankası",
      "türkiye halk bankası",
      "türkiye iş bankası",
      "türkiye vakıflar bankası",
      "yapı ve kredi bankası",
      "YAPIKREDİ",
      "HALKBANK",
      "TEB",
      "ZİRAAT",
      "ODEABANK",
      "HSBC",
      "ING BANK",
      "ŞEKERBANK"
    ]
  const allPossibleSecondLayer=[
    'özelleştirme', 
    'sayin', 
    "vkn",
    'senaryo',
    'TEMELFATURA',
    'Fatura',
    'tipi',
    'iade',
    'geçici',
    'proforma',
    'irsaliye',
    'tarihi',
    'müşteri', 
    'odeme',
    'gün', 
    'ındirimsiz',
    'yalnız',
    'merkezi',
    'mh.',
    'sok.',
    'sokak',
    'türkiye',
    'e-posta',
    '@',
    'vergi', 
    'daire',
    'numara',
    'web',
    'sitesi',
    'www.',
    '.com',
    '.tr',
    'sicil',
    'mersis',
    'işletme',
    'merkez',
    'sayın',
    'san.',
    'tic',
    'tıc',
    'ltd',
    'sti',
    'e-FATURA',
    'qrcode',
    'ETTN',
    'toplam',
    'hesaplanan',
    'genel',
    'özelleştirme',
    'işlem',
    'ödeme Türü',
    'vadeli',
    'bakiye',
    'alacak',
    'masraf',
    'fax',
    'giriş',
    'komisyon',
    'navlun',
    "IBAN",
    "ticaret",
    "limited",
    "LİMİTED",
    "TİCARET",
    "MAH",
    "YOLU",
    "SOK",
    "TR1.2",
    "şirketi",
    "sirketi",
    "KDV",
    "%",
    "No:",
    "No",
    "NO",
    "Ürünler",
    "Malzeme",
    "Açıklama",
    "Künye",
    "Fiyat",
    "TL",
    "Ödenecek",
    "Tutar",
    "İrsaliye",
    "Tel:",
    "Faks:",
    "Sıra",
    "Ürün",
    "teslim",
    "bedeli",
    "Adet",
    "adet",
    "İşlem",
    "saati:",
    "Saat:",
    "Tarih:",
    "yerine",
    "geçer",
    "hesabı",
    "Mal",
    "Hizmet",
    ":",
    "YALNIZ",
    "BİR",
    "İskonto",
    "Not:",
  
    ]
    
    const avoidnumberWords = [
      'bir',
      'iki',
      'üç',
      'dört',
      'beş',
      'altı',
      'yedi',
      'sekiz',
      'dokuz',
      'on',
      'yirmi',
      'otuz',
      'kırk',
      'elli',
      'altmış',
      'yetmiş',
      'seksen',
      'doksan',
      'yuz',
      'bin',
      'Bir',
      'İki',
      'Üç',
      'Dört',
      'Beş',
      'Altı',
      'Yedi',
      'Sekiz',
      'Dokuz',
      'On',
      'Yirmi',
      'Otuz',
      'Kırk',
      'Elli',
      'Altmış',
      'Yetmiş',
      'Seksen',
      'Doksan',
      'Yuz',
      'Bin',
      "BİR",
      "İKİ",
      "DÖRT",
      "BEŞ",
      "ALTI",
      "YEDİ",
      "SEKİZ",
      "DOKUZ",
      "ON",
      "YİRMİ",
      "OTUZ",
      "KIRK",
      "ELLİ",
      "ALTMIŞ",
      "ATMIŞ",
      "YETMİŞ",
      "SEKSEN",
      "DOKSAN",
      "YÜZ",
      "BİN"
    ];
    const avoidtableHeader = [
      'Adı',
      'Künye',
      'Kap',
      'Daralı',
      'Dara',
      'Miktar',
      'Birim',
    ];
  
const kdvpricepossibles = ["Tutar", "Hesaplanan", "Toplam","KDV"];
const specificArray = ['Sayın', 'Sayin', 'SN',"Sn","SAYIN"];

  
  const possibleForUnit = ["Adet", "KG","Kg", "adet","Ad", "kg", "ad"];
  
  const billTypeChecker={
    gsm:{
        label:"GSM Faturası",
        arr:[
            "telsiz",
            "İletişim",
            "abone",
            "dönemi",
            "son",
            "ödeme",
            "öiv",
            "Fatura No",
            "tl",
            "kdv"
            
            
    ],
        limit:6
  },
    ticari:{
        label:"ticari",
        arr:[
        "Mal",
        "Ürün",
        "Hizmet",
        "Miktar",
        "VKN",
        "senaryo",
        "fatura no",
        "tl",
        "kdv"
        ],
        limit:5
  },
    
  };
  async function findNearestValueInArray(arrT, arrP, specified) {
    let allRes = "";
  
    const resultIndex = findIndexOfMatchedValue(arrT, specified);
  
    if (resultIndex === -1 || resultIndex >= arrT.length) {
      try {
  
        return await findMatchingValuesName(arrT, isimler);
      } catch (error) {
        throw error;
      }
    } else {
      const distances = arrP.map((possibility) => {
        const index = arrT.findIndex((line) => line.includes(possibility));
        return {
          index: index,
          distance: index !== -1 ? Math.abs(resultIndex - index) : Infinity
        };
      });
  
      if (distances.filter(d => d.index > 0).length < 1) {
        try {
          return await findMatchingValuesName(arrT, isimler);
        } catch (error) {
          throw error;
        }
      } else {
        distances.sort((a, b) => a.distance - b.distance);
        const nearestIndex = distances[0].index;
        allRes = arrT[nearestIndex];
        return Promise.resolve(allRes);
      }
    }
  };


  function findIndexOfMatchedValue(arrT, arrP) {
    for (const possibility of arrP) {
        const index = arrT.findIndex(line => line.includes(possibility));
        if (index !== -1) {
            return index;
        }
    }
    return -1; // Return -1 if no match is found
  };

  const findMatchingValuesName = (arrT, arrN) => {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(arrN)) {
        reject(new Error('arrN is not an array'));
        return;
      }
  
      const uniqueNames = new Set();
  
      for (const possibility of arrN) {
        const lowercasePossibility = possibility.toLowerCase();
  
        arrT.forEach((line, index) => {
          if (line?.toLowerCase()?.includes(lowercasePossibility)) {
            uniqueNames.add(line);
          }
        });
      }
  
      // Convert the Set back to an array
      const uniqueNamesArray = [...uniqueNames];
  
      resolve(uniqueNamesArray[0]);
    });
  };


  async function processParameterObject(parameterObject, extractedTextArray) {
    const result = {};
  
    for (const key in parameterObject) {
      const { possible, checkForNumber, subtractPossibilities, label } = parameterObject[key];
      const possibilityArray = possible.map(innerArray => innerArray.map(possibility => possibility.toLowerCase()));
  
      const partialResult = getObjectByKey3(key, extractedTextArray, possibilityArray, subtractPossibilities, checkForNumber);
  
      result[label] = partialResult[key];
    }
    const findKDV= extractNumbersWithPercentageAndKDV(extractedTextArray)
    const findKDVprice= extractKDVPrice(extractedTextArray,kdvpricepossibles)
  
    result["KDV_Oranı"]=findKDV;
    result["KDV_Tutari"]=findKDVprice["KDV_Tutari"];
  
    return result;
  };

  const tableFinder=async(arr)=>{
    const filteredLinesFirstLayer = arr.filter(line =>
        !allPossible.concat(isimler).some(word => line.toLowerCase()?.includes(word.toLowerCase()))
        //!allPossible.concat(iller).concat(isimler).some(word => line.toLowerCase()?.includes(word.toLowerCase()))
      );
      const concattedFirstLayer = [].concat.apply([], filteredLinesFirstLayer.map(line => line.split(/\s+/)));
  
      const longerLines=concattedFirstLayer.filter(l=>String(l).length>25)
      const filteredLinesSecondLayer = concattedFirstLayer.filter(line =>
        
          !allPossibleSecondLayer.some(word => line.toLowerCase()?.includes(word.toLowerCase()))
        
      ).filter(word => isNaN(parseInt(word, 10))).concat(longerLines);
  
    
      const possibleProductArray = ["bedeli","Adet","birim","TL","Ad","BR","Bedeli"];
      const filteredLinesThirdLayer = filteredLinesSecondLayer.filter(prefix =>
        arr.some(item =>
          item.includes(prefix) && possibleProductArray.some(element => item.includes(element))
        )
      );
    
      const filteredLinesForthLayer = arr.filter(prefix =>
        filteredLinesThirdLayer.some(item =>
          prefix.includes(item)
        )
      ).filter(line => !containsConsecutiveAvoidWords(avoidnumberWords,line)).filter(line => !containsConsecutiveAvoidWords(avoidtableHeader,line));
  
      const resultArray = filteredLinesForthLayer.map(line => extractInfo(line));
  
      return {
        //Mal_Hizmet_json:filteredLinesForthLayer,
        table:resultArray
      }
  
  }

  function getObjectByKey3(key, array, possibilityArray, subtractPossibilities = false, checkForNumber = false) {
    const result = {
      [key]: array.reduce((accumulator, text) => {
        const lowercaseText = text.toLowerCase();
        const matchedPossibilities = possibilityArray.filter(innerArray =>
          innerArray.some(possibility =>
            lowercaseText.includes(possibility.toLowerCase())
          )
        );
  
        if (matchedPossibilities.length === possibilityArray.length) {
          let resultText = text;
  
          if (subtractPossibilities) {
            resultText = matchedPossibilities
              .flat()
              .map(possibility => possibility.toLowerCase())
              .reduce((text, possibility) => text.replace(possibility, ''), lowercaseText)
              .replace(/:/g, '')
              .trim();
          }
  
          if(key.clearify){
            resultText?.trim().replace(/^[\s(]+|[\s)]+$/g, '');
  
        }
          if (checkForNumber) {
            //sconst numberMatch = resultText.match(/\d+/); //tam sayı
            //const numberMatch = resultText.match(/\d+(?:,\d{3})*(?:\.\d+)?/); //virgülsüz
            const numberMatch = resultText.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:,\d+)?/);
  
            if (numberMatch) {
              accumulator.push(numberMatch[0]);
            } else {
              accumulator.push("not found");
            }
          } else {
            accumulator.push(resultText);
          }
        }
        
        return accumulator;
      }, [])
    };
  
    return result;
  };


  function extractNumbersWithPercentageAndKDV(arr) {
    const result = [];
  
    arr.forEach((text) => {
      // Check if the line has "KDV"
      if (text.includes("KDV")) {
        // Match numbers with % in front or behind them
        const matches = text.match(/%\d+|\d+%/g);
  
        if (matches) {
          result.push(...matches);
        }
      }
    });
  
    return result;
  };


  function extractKDVPrice(arr, keywords) {
    const result = {};
  
    for (let i = 0; i < arr.length; i++) {
      const line = arr[i];
  
      // Check if the line contains "KDV" and one of the specified keywords
      if (line.includes("KDV") && keywords.some(keyword => line.includes(keyword))) {
        // Extract numeric values followed by "TL" and not between parentheses
        const matches = line.match(/(\d[\d.,]*)\s*TL/);
  
        if (matches) {
            result["KDV_Tutari"] = result["KDV_Tutari"] || [];
            result["KDV_Tutari"].push(...matches);
        }else{
            result["KDV_Tutari"] = result["KDV_Tutari"] || [];

        }
      }
    }
  
    return result;
  };

  function containsConsecutiveAvoidWords(arr,line) {
  
    var result;
    let consecutiveCount = 0;
    
    for (const word of arr) {
      if (String(line).includes(word)) {
        consecutiveCount++;
        if (consecutiveCount >= 2) {
          result= true;
        }
      } else {
        consecutiveCount = 0;
        result=false
      }
    }
    
    return result;
    }
    
    function extractNumbersWithPercentageAndKDV(arr) {
      const result = [];
    
      arr.forEach((text) => {
        // Check if the line has "KDV"
        if (text.includes("KDV")) {
          // Match numbers with % in front or behind them
          const matches = text.match(/%\d+|\d+%/g);
    
          if (matches) {
            result.push(...matches);
          }
        }
      });
    
      return result;
    }
    


    function extractInfo(line) {
        // result object başlat
        const result = {};
        //fatura tipini tedspit et
        var priceType;
        var splitted=String(line).split(" ");
        var trimmedAndFiltered = splitted.map(element => element.trim()).filter(Boolean);
        var TLcount=trimmedAndFiltered.filter(f=>f==="TL").length;
        if(TLcount===3){
          priceType="uclu"
        }
        const tlIndices = [];
        trimmedAndFiltered.forEach((word, index) => {
        if (word === 'TL') {
          tlIndices.push(index);
        }
        });
        
        var billType;
        if(String(line).includes("%")){
          billType="kdvli";
          const kdvMatch = line.match(/%(\d+)/);
          result.KDV = kdvMatch ? `%${kdvMatch[1]}` : null;
          if(!possibleForUnit.some(s=>String(line).includes(s))){
            billType="birimsiz"
          }
        }else if(!String(line).includes("%")){
          billType="kdvsiz"
        }
        
        // id varsa çıkarma
        const idMatch = line.match(/^\d+/);
        result.id = idMatch ? parseInt(idMatch[0]) : null;
        
        // birim çıkarma
        
        
        
          // birim fiyat ve adet çıkarma
        
        if(billType==="kdvsiz"){
          var splitted=String(line).split(" ");
          var trimmedAndFiltered = splitted.map(element => element.trim()).filter(Boolean);
        
          var unitindex=trimmedAndFiltered.reverse().findIndex(f=>possibleForUnit.some(s=>s===f))
          result.amount=trimmedAndFiltered[unitindex+1] 
          result.unitPrice=trimmedAndFiltered[unitindex-1]
          result.unit = possibleForUnit.find(unit => line.includes(unit)) || null;
        
        
        }
        
        if(billType==="kdvli"){
          const amountUnitPriceMatch = line.match(/([\d.,]+)\s*([A-Za-z]+)(?:\s*([\d.,]+)\s*%)?/);
          if (amountUnitPriceMatch) {
            result.amount = parseFloat(amountUnitPriceMatch[1]);
            result.unit = possibleForUnit.find(unit => amountUnitPriceMatch[2].toLowerCase().includes(unit.toLowerCase())) || null;
            result.unitPrice = amountUnitPriceMatch[3] ? amountUnitPriceMatch[3] : null;
          }
        }
        
        // Extracting productTotalPrice
        const totalPriceMatch = line.match(/([.,\d]+)$/);
        result.productTotalPrice = totalPriceMatch ? totalPriceMatch[1].replace("TL","") : null;
        
        if(billType!=="birimsiz"&&billType!=="kdvsiz"){
          result.unit = possibleForUnit.find(unit => line.includes(unit)) || null;
          const unitPriceMatch = line.match(/(\d+[.,]?\d*)\s*%/);
          result.unitPrice = unitPriceMatch ? unitPriceMatch[1] : null;
        
        }
        
        if(billType ==="kdvsiz"){
          var splitted=String(line).split(" ");
          var trimmedAndFiltered = splitted.map(element => element.trim())?.filter(Boolean);
          var unit=trimmedAndFiltered.findIndex(f=>possibleForUnit.some(s=>s===f))
          result.productTotalPrice=trimmedAndFiltered[trimmedAndFiltered.length-2]?.replace("TL","")
        }
        if(billType ==="birimsiz"){
            var splitted=String(line).split(" ");
            var trimmedAndFiltered = splitted.map(element => element.trim()).filter(Boolean);
        
        
        
            const priceRegex = /(\d+\.\d{2})\s*TL$/;
            const match = line.match(priceRegex);
            result.productTotalPrice = match ? match[1] : null;
            result.unit=null;
            
        }
        if(priceType==="uclu"&&(!result.amount||!result.unitPrice)){
          result.unitPrice=trimmedAndFiltered[tlIndices[0]-1];
          result.amount=trimmedAndFiltered[tlIndices[0]-2];
          result.KAP=trimmedAndFiltered[tlIndices[0]-3];
          result.KDVTutar=trimmedAndFiltered[tlIndices[1]-1];
        
        }
        
        
        if(!result.amount && result.unit && line.includes("TL")){
            var stringedLayer=line.split("").join("").replace(/\s/g,"").trim()
            var splittedLayer = stringedLayer.split(/KG|TL/).filter(Boolean);
          splittedLayer[0] = splittedLayer[0].split(',')[1];
          result.unitPrice=splittedLayer[splittedLayer.length-3];
          result.amount=Math.round(parseInt(result.productTotalPrice)/parseInt(result.unitPrice))
        
        }
        let threshold = Number.MAX_SAFE_INTEGER;
        
        if (Math.abs(result.amount) > threshold && result.unitPrice) {
        result.amount=Math.round(parseInt(result.productTotalPrice.replace(".",""))/parseInt(result.unitPrice.replace(".","")))
        
        }
        if(result.amount&&result.productTotalPrice&&result.unitPrice&&(result.unitPrice===result.productTotalPrice)){
        result.productTotalPrice=(parseFloat(String(result.unitPrice).replace(",","."))*parseFloat(String(result.amount).replace(".",""))).toFixed(2)
        
        }
        let words = line.match(/[^\d\s]{4,}/g);
        words = words?.filter(word => word !== null);
        
        // Extracting productName
        const productNameMatch = line
        .replace(/^\d+/, '')  // Remove id
        .replace(result["amount"], '')  // Remove amount and unit
        .replace(result["unit"], '')  // Remove amount and unit
        .replace(result["unitPrice"],'') //remove unitprice
        .replace(result["KDV"], '')  // Remove KDV
        .replace(result["productTotalPrice"], '')  // Remove productTotalPrice
        .replace(result["KAP"], '')  // Remove productTotalPrice
        .replace(result["KDVTutar"], '')  // Remove productTotalPrice
        .replaceAll("TL", '')  // Remove productTotalPrice
        .replace("tl", '')  // Remove productTotalPrice
        .replace("%", '')  // Remove productTotalPrice
        //.replace(/\s+/g, ' ').trim()
        //.replace(/\s{2,}/g, '')
        .trim();
        result.productName = productNameMatch.length > 0 
        ? productNameMatch.split(" ").some(s=>s.length>21)
        ?productNameMatch.match(/[^\d\s]{4,}/g)?.filter(word => word !== null)[0]
        :productNameMatch
        : null;
        result.billType=billType;
        
        return result;
        
        }




// app.post('/upload', upload.single('image'), async (req, res) => {
//     const worker = createWorker("tur");

//     (async () => {
//         await (await worker).load();
        
//         await (await worker).setParameters({
//           //tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyz',
//           preserve_interword_spaces: '0',
//           psm: 6, // Example: Single block of text
//           oem: 1 // Example: LSTM OCR only


//         });
//         const { data: { text } } = await (await worker).recognize(req.file.buffer);
//         console.log(text);
//         await (await worker).terminate();
//       })();
//     try {

//         Tesseract.recognize(
//             // this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
//             req.file.buffer, 
//             'tur',
//             { logger: m => console.log(m),
//                 psm: 6, // Experiment with different page segmentation modes
//                 oem: 1, // Use different OCR engine modes     
//             }
//             ).then(({ data: { text } }) => {
//             //console.log(text);
//             let processedText = text.replace(/"/g, ''); 
//             const textLines = processedText.split(/\r?\n/);
//             const nonEmptyTextLines = textLines.filter(line => line.trim() !== '').map(line => line.trim());
//             determineBillType(nonEmptyTextLines,billTypeChecker)
//             .then(async(result) => {

                
//             if(result.type==="başka"){
//                 const firmName=await findNearestValueInArray(nonEmptyTextLines, firmNameArray,specificArray,"")
//                 const details= await processParameterObject(parameterObjectForFis,nonEmptyTextLines)
//                 const table= await tableFinder(nonEmptyTextLines)
//                 res.status(200).json({ 
//                     success: true, 
//                     textContent: processedText,
//                     textLines:nonEmptyTextLines,
//                     Cari_Adı:firmName,
//                     billType:result.type,
//                     ...details,
//                     ...table,
//                    }); 
//             }
//               else if(result.type!=="başka"){
//                 const firmName=await findNearestValueInArray(nonEmptyTextLines, firmNameArray,specificArray,"")
//                 const details= await processParameterObject(parameterObject,nonEmptyTextLines)
//                 const table= await tableFinder(nonEmptyTextLines)
//                 res.status(200).json({ 
//                   success: true, 
//                   textContent: processedText,
//                   textLines:nonEmptyTextLines,
//                   Cari_Adı:firmName,
//                   billType:result.type,
//                   ...details,
//                   ...table,
//                  });
//               }else{
//                 res.status(400).json("bu bir fatura değil")
        
//               }
//             });

//             //res.json({text:text})
//             })
//         .catch((error) => {
//           console.log(error.message)
//         })
//     } catch (error) {
//       console.error('Error:', error.message);
//       res.status(500).send('Internal Server Error');
//     }
//   });
app.post('/upload', upload.single('image'), async (req, res) => {
    
    try {

        Tesseract.recognize(
            // this first argument is for the location of an image it can be a //url like below or you can set a local path in your computer
            req.file.buffer, 
            'tur',
            { logger: m => console.log(m),
                psm: 6, // Experiment with different page segmentation modes
                oem: 1, // Use different OCR engine modes     
            }
            ).then(({ data: { text } }) => {
            console.log(text);
            let processedText = text.replace(/"/g, ''); 
            const textLines = processedText.split(/\r?\n/);
            const nonEmptyTextLines = textLines.filter(line => line.trim() !== '').map(line => line.trim());
            determineBillType(nonEmptyTextLines,billTypeChecker)
            .then(async(result) => {

                
            if(result.type==="başka"){
                const firmName=await findNearestValueInArray(nonEmptyTextLines, firmNameArray,specificArray,"")
                const details= await processParameterObject(parameterObjectForFis,nonEmptyTextLines)
                const table= await tableFinder(nonEmptyTextLines)
                res.status(200).json({ 
                    success: true, 
                    textContent: processedText,
                    textLines:nonEmptyTextLines,
                    Cari_Adı:firmName,
                    billType:result.type,
                    ...details,
                    ...table,
                   }); 
            }
              else if(result.type!=="başka"){
                const firmName=await findNearestValueInArray(nonEmptyTextLines, firmNameArray,specificArray,"")
                const details= await processParameterObject(parameterObject,nonEmptyTextLines)
                const table= await tableFinder(nonEmptyTextLines)
                res.status(200).json({ 
                  success: true, 
                  textContent: processedText,
                  textLines:nonEmptyTextLines,
                  Cari_Adı:firmName,
                  billType:result.type,
                  ...details,
                  ...table,
                 });
              }else{
                res.status(400).json("bu bir fatura değil")
        
              }
            });

            //res.json({text:text})
            })
        .catch((error) => {
          console.log(error.message)
        })
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).send('Internal Server Error');
    }
  });

  


app.get('/', (req, res) => {
    res.send("ocr on");
  });

app.listen(process.env.PORT || port, () => {
    console.log(`OCR is running on http://localhost:${port}`);
  });