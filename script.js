const chartsContainer = document.getElementById('charts-container');

// Function to fetch JSON data
async function fetchJSON(url) {
    const response = await fetch(url);
    return response.json();
}

// Function to create a chart
function createChart(data, title) {
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart-container';
    
    const chartTitle = document.createElement('div');
    chartTitle.className = 'chart-title';
    chartTitle.textContent = title;
    
    const canvas = document.createElement('canvas');
    
    chartContainer.appendChild(chartTitle);
    chartContainer.appendChild(canvas);
    chartsContainer.appendChild(chartContainer);

    const ctx = canvas.getContext('2d');

    const chartData = {
        labels: data.map(item => moment(item.Date, 'YYYY-MM-DD').format('jYYYY/jMM/jDD')),
        datasets: [{
            label: 'Price',
            data: data.map(item => ({
                x: moment(item.Date, 'YYYY-MM-DD').format('jYYYY/jMM/jDD'),
                y: item.Price ? parseInt(item.Price) : null
            })),
            borderColor: 'blue',
            backgroundColor: data.map(item => item.Discount !== "0" ? 'red' : 'grey'),
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBorderWidth: 0,
            fill: false
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const discount = data[context.dataIndex].Discount;
                            return `${label}: ${value.toLocaleString()} (Discount: ${discount}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'jYYYY/jMM/jDD',
                        unit: 'month',
                        displayFormats: {
                            month: 'jYYYY/jMM'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    },
                    ticks: {
                        callback: function(value, index, values) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Function to process all JSON files
async function processJSONFiles() {
    try {
        const response = await fetch('/api/items');
        const files = await response.json();

        for (const file of files) {
            const data = await fetchJSON(`/api/items/${file}`);
            createChart(data, file.replace('.json', ''));
        }
    } catch (error) {
        console.error('Error processing JSON files:', error);
    }
}

// Call the function to process all JSON files
processJSONFiles();