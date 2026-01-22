function generateFilenames() {
    const jsonInput = document.getElementById('jsonInput').value;
    const errorDiv = document.getElementById('error');
    const resultsList = document.getElementById('resultsList');
    
    // Clear previous results and errors
    errorDiv.textContent = '';
    resultsList.innerHTML = '';

    let data = {};
    if (jsonInput.trim()) {
        try {
            data = JSON.parse(jsonInput);
        } catch (e) {
            errorDiv.textContent = 'Invalid JSON input. Please check your syntax.';
            return;
        }
    }

    const manualCompany = document.getElementById('manualCompany').value;
    const manualJobTitle = document.getElementById('manualJobTitle').value;

    const companyName = data.company_name || manualCompany || 'Unknown_Company';
    const jobTitle = data.job_title || manualJobTitle || 'Unknown_Role';

    // Sanitize function to replace spaces/special chars with underscores
    const sanitize = (str) => {
        return str.trim()
            .replace(/[\s\W-]+/g, '_') // Replace spaces and non-word chars with underscore
            .replace(/^_+|_+$/g, ''); // Trim leading/trailing underscores
    };

    const cleanCompany = sanitize(companyName);
    const cleanTitle = sanitize(jobTitle);

    // Get current date formatted as YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const commonPart = `${cleanCompany}--${cleanTitle}`;

    const files = [
        { label: 'Cover Letter', name: `CoverLetter_${dateStr}_${commonPart}` },
        { label: 'Job Post', name: `JobPost_${dateStr}_${commonPart}` },
        { label: 'Resume', name: `Resume_${dateStr}_${commonPart}` },
        { label: 'CV', name: `CV_${dateStr}_${commonPart}` }
    ];

    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'result-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'filename';
        nameSpan.textContent = file.name;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => copyToClipboard(file.name, copyBtn);

        li.appendChild(nameSpan);
        li.appendChild(copyBtn);
        resultsList.appendChild(li);
    });
}

function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btnElement.textContent;
        btnElement.textContent = 'Copied!';
        setTimeout(() => {
            btnElement.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}
