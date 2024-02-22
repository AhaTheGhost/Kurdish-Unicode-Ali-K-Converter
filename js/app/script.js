const toggleSwitch = document.getElementById('slider'); 

// Immediately-invoked function
(function() {
    if(localStorage.getItem('AktoUTheme') == "Dark"){
        toggleSwitch.checked = true;
        document.documentElement.setAttribute('theme', 'dark'); 
    }
})();

// Toggle light/dark mode and open in new tab shortcuts
document.addEventListener('keydown', function(event) {
    // Check for Ctrl + Shift + L to toggle light/dark mode
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
        document.getElementById('slider').click();
        event.preventDefault();
    } else if (document.getElementById('newTab') && event.ctrlKey && event.shiftKey && event.key === 'O') {
        // Check for Ctrl + Shift + O to open in a new tab
        document.getElementById('newTab').click();
        event.preventDefault();
    }
});


// Text conversion algorithm
const unicodeTA = document.getElementById('unicodeTA');
const alikTA = document.getElementById('alikTA');

// Character sets for Unicode and Ali K
const aliChars = ['0', '1', '2' ,'3' ,'4' ,'5' , '6', '7', '8', '9', 'ض', 'ث', 'لا', 'ي', 'ظ', 'ذ', 'ؤ', 'لَ', 'رِ', 'لَا', 'ى', 'يَ',  'آ', 'ْ', 'ك', 'ط', 'وَ', 'ة', 'خ', 'ىَ', '%'];
const uniChars = ['٠', '١', '٢' ,'٣' ,'٤' ,'٥' , '٦', '٧', '٨', '٩', 'چ', 'پ', 'لا', 'ی', 'ڤ', 'ژ', 'ۆ', 'ڵ', 'ڕ','ڵا' ,'ی' ,'ێ' , 'ێ' , 'ء', 'ک', 'گ', 'ۆ', 'ە', 'خ', 'ێ', '٪'];

let chars, newChars;

const inpEve = new Event('input');

// Event listeners for text areas
unicodeTA.addEventListener('input', () => { convertTo(1); }); // 1 converts Unicode to Ali K
alikTA.addEventListener('input', () => { convertTo(2); }); // 2 Ali K to Unicode

// Conversion function
function convertTo(target) {
    // Determine the input and output text areas based on the target
    const inputTextArea = (target === 1) ? unicodeTA : alikTA;
    const outputTextArea = (target === 1) ? alikTA : unicodeTA;

    // Get the input text from the appropriate text area
    chars = inputTextArea.value;

    // Initialize the new converted text
    newChars = "";

    // Loop through each character in the input text
    for (let i = 0; i < chars.length; i++) {
        // Conversion logic based on character sets
        if (uniChars.includes(chars.charAt(i)) && target === 1) {
            newChars += aliChars[uniChars.indexOf(chars.charAt(i))];
        } else if (chars.charAt(i) === 'ا' && chars.charAt(i - 1) === 'ڵ' && target === 1) {
            newChars = newChars.slice(0, -2);
            newChars += 'لآ';
        } else if ((chars.charAt(i) === 'َ' || chars.charAt(i) === 'ِ') && aliChars.includes(chars.charAt(i - 1) + chars.charAt(i)) && target === 2) {
            newChars = newChars.slice(0, -1);
            newChars += uniChars[aliChars.indexOf(chars.charAt(i - 1) + chars.charAt(i))];
        } else if (chars.charAt(i) === 'َ' && chars.charAt(i - 1) === 'ا' && chars.charAt(i - 2) === 'ل' && target === 2) {
            newChars = newChars.slice(0, -2);
            newChars += 'ڵا';
        } else if (chars.charAt(i) === 'أ' && chars.charAt(i - 1) === 'ل' && target === 2) {
            newChars = newChars.slice(0, -1);
            newChars += 'ڵ';
        } else if (chars.charAt(i) === 'آ' && chars.charAt(i - 1) === 'ل' && target === 2) {
            newChars = newChars.slice(0, -1);
            newChars += 'ڵا';
        } else if (aliChars.includes(chars.charAt(i)) && target === 2) {
            newChars += uniChars[aliChars.indexOf(chars.charAt(i))];
        } else {
            newChars += chars.charAt(i);
        }
    }

    // Set the converted text to the output text area
    outputTextArea.value = newChars;
}

// Triple click text copy
[unicodeTA, alikTA].forEach((el) => {
    // Add a triple-click event listener
    el.addEventListener('click', (e) => {
        // Check if it's a triple click and the textarea has content then copy
            if (e.detail === 3 && e.target.value !== '')
                copyText(e.target);
    });
});

// Function to copy text to clipboard
function copyText(textarea) {
    textarea.select();
    // Set the selection range to cover the entire text
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value);
    Toastify({ text: "Copied", duration: 1500 }).showToast();
}

/* Open in new tab */
const newTab = document.getElementById("newTab");
if(newTab)
    newTab.addEventListener("click", ()=> { chrome.tabs.create({url: 'index.html'}); });

// Open information page in new tab
const newTabInfo = document.getElementById("info");
if(newTabInfo)
    newTabInfo.addEventListener("click", ()=> { chrome.tabs.create({url: 'info.html'}); });

// Drag and drop file reader setup
[unicodeTA, alikTA].forEach(async (el) => {
    el.addEventListener("dragover", (event) => {
        el.setAttribute("drop-active", "true");
        event.preventDefault();
    });

    el.addEventListener("dragleave", () => {
        el.setAttribute("drop-active", "false");
    });

    el.addEventListener("drop", async (ev) => {
      ev.preventDefault();
      showLoadingOverlay();

      if(ev.dataTransfer.items.length > 1){
          Toastify({ text: "Can not read more than 1 file at a time", duration: 2000, backgroundColor: 'crimson' }).showToast();
          hideLoadingOverlay();
        } else {
            try {
                const file = ev.dataTransfer.items[0];
                if (file && file.kind === 'file')
                    await handleFile(file, el);
            } catch (error) {
                Toastify({ text: "Error handling file!", duration: 2000, backgroundColor: 'crimson' }).showToast();
                console.log("Something went wrong! if this issue persists and you see this, then kindly report it to the developer.", error);
            }
        }      

      el.setAttribute("drop-active", "false");
      hideLoadingOverlay();
    });

});

// Handle file function
async function handleFile(file, el) {
    // Convert DataTransferItem to File
    file = file.getAsFile();
    
    // Supported file extensions
    const exts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
    const ext = file.name.split(".")[file.name.split(".").length - 1];

    // Check file size and type
    if (file.size / 1024 / 1024 > 500) {
        Toastify({ text: "File cannot be larger than 500MB", duration: 2000, backgroundColor: 'crimson' }).showToast();
    } else if (ext == "txt") {
        // Read and display text for TXT files
        const text = await readTxtFile(file);
        el.value = text;
        el.dispatchEvent(inpEve);
    } else if (exts.includes(ext)) {
        // Extract and display text for supported file types
        el.value = await extractTextFromFile(file, ext);
        el.dispatchEvent(inpEve);
    } else {
        Toastify({ text: "'." + ext + "' filetype cannot be converted", duration: 2000, backgroundColor: 'crimson' }).showToast();
    }
}

// Read TXT file function
function readTxtFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (read) => resolve(read.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Extract text from file function
function extractTextFromFile(file, ext) {
    return new Promise((resolve, reject) => {
        const docToText = new DocToText();
        docToText.extractToText(file, ext).then((text) => {  
            resolve(processExtractedText(text));
         }).catch(reject);
    });
}

// Function to filter the extracted text by removing the extra commas and leading
// newlines after using the docToText library
function processExtractedText(text){
    const extractedText = text
    .replace(/^\n+/, '').trim()     // Remove first newlines if exists
    .split(/\n/);                   // Split to filter commas
    let commaFreeText = [];
    for(i = 0; i < extractedText.length; i++)
        if(extractedText[i] != ","){ commaFreeText.push(extractedText[i].replace(/,/g, "")); }           
    
    return commaFreeText.join('\n') // Join filtered
    .replace(/(.)\n\n/g, '$1\n');   // Remove extra newlines
}
  
// Function to switch theme  
toggleSwitch.addEventListener('change', (e) => {
    // if slider is checked default theme changes to dark
    if (e.target.checked) {
        document.documentElement.setAttribute('theme', 'dark');
        localStorage.setItem('AktoUTheme', 'Dark');
    } else {
        document.documentElement.setAttribute('theme', 'light');
        localStorage.setItem('AktoUTheme', 'light');
    }
});

// Loading overlay
const loading = document.getElementsByClassName("loading-overlay")[0].style;
// Functions to display or hide the loading overlay
function showLoadingOverlay() { loading.display = "block"; }
function hideLoadingOverlay() { loading.display = "none"; }

// Set text version to manifest version
document.getElementById("version").innerText = "v" + chrome.runtime.getManifest().version;
