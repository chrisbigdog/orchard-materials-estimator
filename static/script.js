function estimateMaterials() {
    let blockSize = document.getElementById('blockSize').value;
    
    if (blockSize <= 0 || isNaN(blockSize)) {
        alert("Please enter a valid block size.");
        return;
    }

    document.getElementById('resultsTable').getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan='3'>Calculating...</td></tr>";

    fetch("/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ block_size_sqm: blockSize })
    })
    .then(response => response.json())
    .then(data => {
        let resultsTable = document.getElementById('resultsTable').getElementsByTagName('tbody')[0];
        resultsTable.innerHTML = "";
        
        let categoryMapping = {
            "UNDERVINE": ["Undervine screw", "Undervine Clips", "Undervine Cloth", "2.5mm HT wire"],
            "AGBEAM": ["Agbeam Staple", "Agbeam", "Agbeam joiners", "50 mil Staple", "Plascourse (75x150) cutting", "25mm tex screw"],
            "HAIL CLOTH": ["Hail cloth V16C18", "Bent Staple", "Gate Staple", "50 mil Staple", "7.5 Splice", "Nitto Tape", "4.5mm HT Wire", "1.3m PVC Conduits", "Thimble and Rods with Nut", "350mm Screw Anchor", "7.5mm Sleeves", "12mm sleeves", "7.5mm cable"]
        };
        
        for (let category in categoryMapping) {
            // Add category row
            let categoryRow = resultsTable.insertRow();
            let categoryCell = categoryRow.insertCell(0);
            categoryCell.colSpan = 3;
            categoryCell.innerText = category + ": Materials under this category name:";
            categoryCell.style.fontWeight = "bold";
            categoryCell.style.backgroundColor = "#f0f0f0";
            
            // Add materials under category
            categoryMapping[category].forEach(material => {
                if (data[material]) {
                    let row = resultsTable.insertRow();
                    row.insertCell(0).innerText = material;
                    row.insertCell(1).innerText = data[material].quantity;
                    row.insertCell(2).innerText = data[material].unit;
                }
            });
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while fetching the data. Please try again.");
    });
}

// Dark Mode Toggle
const toggleDarkMode = document.getElementById('toggleDarkMode');
toggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        toggleDarkMode.innerText = "☀️";
    } else {
        localStorage.setItem('darkMode', 'disabled');
        toggleDarkMode.innerText = "🌙";
    }
});

// Load Dark Mode Preference
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    toggleDarkMode.innerText = "☀️";
}
