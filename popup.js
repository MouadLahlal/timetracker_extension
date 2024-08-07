function secondsToString(seconds, compressed = false) {
    let hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    let timeString = "";
    if (hours) {
        timeString += hours + " hrs ";
    }
    if (minutes) {
        timeString += minutes + " min ";
    }
    if (seconds) {
        timeString += seconds + " sec ";
    }
    if (!compressed) {
        return timeString;
    } else {
        if (hours) {
            return `${hours}h`;
        }
        if (minutes) {
            return `${minutes}m`;
        }
        if (seconds) {
            return `${seconds}s`;
        }
    }
}

var color = [
    "rgba(255, 0, 0, 1)",
    "rgb(255, 51, 0)",
    "rgb(255, 102, 0)",
    "rgb(255, 153, 0)",
    "rgb(255, 204, 0)",
    "rgb(255, 255, 0)",
    "rgb(204, 255, 0)",
    "rgb(153, 255, 0)",
    "rgb(102, 255, 0)",
    "rgb(51, 255, 0)",
];


window.onload = async function() {
    let res = await fetch('http://localhost:3000/time/today');
    let data = await res.json();

    let domains = [];
    let times = [];
    let totalTime = 0;

    const webTable = document.getElementById("webList");

    for (const domain in data) {
        let row = document.createElement("tr");
        let siteURL = document.createElement("td");
        siteURL.innerText = domain;
        let siteTime = document.createElement("td");
        siteTime.innerText = secondsToString(data[domain]);
        row.appendChild(siteURL);
        row.appendChild(siteTime);
        webTable.appendChild(row);
        domains.push(domain);
        times.push(data[domain]);
        totalTime += data[domain];
    }

    new Chart(document.getElementById("pie-chart"), {
        type: "doughnut", // ci sono diversi tipi : polarArea, line, pie, doughnut
        data: {
            labels: domains,
            datasets: [
                {
                    label: "Time Spent",
                    backgroundColor: color,
                    data: times,
                },
            ],
        },
        options: {
            title: {
                display: true,
                text: "Top Visited Sites Today",
            },
            legend: {
                display: true,
            },
            // circumference: Math.PI,
            // rotation: Math.PI,
        },
    });

    document.getElementById("totalTimeToday").innerText = secondsToString(totalTime);
}
