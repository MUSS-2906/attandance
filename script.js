
async function loadAttendance() {
  const summaryText = document.getElementById("summaryText");
  const tbody = document.getElementById("attendanceBody");

  // Clear old content
  summaryText.textContent = "Loading...";
  tbody.innerHTML = "";

  try {
    // Fetch data from backend
    const res = await fetch("http://127.0.0.1:5000/generate_report");
    const data = await res.json();
    console.log("Backend Response:", data);

    // Show summary always
    summaryText.textContent =
      `${data.report} | Total Students: ${data.total_students} | Present: ${data.present} | Absent: ${data.absent}`;

    // If no student details yet, show a row
    if (!data.students) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3">⚠️ No detailed student records yet</td>`;
      tbody.appendChild(tr);
    } else {
      // Fill table if detailed data is present
      for (const studentId in data.students) {
        data.students[studentId].forEach(record => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${studentId}</td>
            <td>—</td>
            <td>${record.status}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  } catch (err) {
    summaryText.textContent = "⚠️ Error fetching data.";
    console.error(err);
  }
}

// Run when page loads
window.onload = loadAttendance;
// Handle Download Excel button
document.getElementById("excelBtn").addEventListener("click", () => {
  window.location.href = "http://127.0.0.1:5000/generate_report?export=csv";
});


document.getElementById("pdfBtn").addEventListener("click", () => {
  window.location.href = "http://127.0.0.1:5000/generate_report?export=pdf";
});