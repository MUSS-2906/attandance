async function loadAttendance() {
  const summaryText = document.getElementById("summaryText");
  const tbody = document.getElementById("attendanceBody");

  // Clear old content
  summaryText.textContent = "Loading...";
  tbody.innerHTML = "";

  try {
    // Fetch data from backend with error handling
    const res = await fetch("/generate_report");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("Backend Response:", data);
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      throw new Error("Invalid data received from server");
    }

    // Show summary with timestamp
    const reportText = `${data.report || 'Attendance Report'} | Total Students: ${data.total_students || 0} | Present: ${data.present || 0} | Absent: ${data.absent || 0}`;
    summaryText.textContent = reportText;

    // Check if student details exist and display them
    if (!data.students || Object.keys(data.students).length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">⚠️ No detailed student records yet</td>`;
      tbody.appendChild(tr);
      console.log("No student data found");
    } else {
      console.log("Processing student data:", data.students);
      // Fill table with student data
      let recordCount = 0;
      for (const studentId in data.students) {
        if (data.students[studentId] && Array.isArray(data.students[studentId])) {
          data.students[studentId].forEach(record => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${studentId}</td>
              <td>${record.name || '—'}</td>
              <td>${record.status || '—'}</td>
              <td>${record.readable_timestamp || record.full_timestamp || record.date || '—'}</td>
            `;
            tbody.appendChild(tr);
            recordCount++;
          });
        }
      }
      console.log(`Loaded ${recordCount} attendance records`);
    }
  } catch (err) {
    const errorMsg = `⚠️ Error fetching data: ${err.message}`;
    summaryText.textContent = errorMsg;
    console.error("Attendance loading error:", err);
    
    // Show error in table
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="color: red;">❌ ${err.message}</td>`;
    tbody.appendChild(tr);
  }
}

// Run when page loads
window.onload = function() {
  loadAttendance();
  setupForm();
  updateCurrentDateTime();
  // Update time every second
  setInterval(updateCurrentDateTime, 1000);
};

function updateCurrentDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  try {
    const dateTimeString = now.toLocaleDateString('en-US', options);
    const currentDateTimeElement = document.getElementById('currentDateTime');
    if (currentDateTimeElement) {
      currentDateTimeElement.textContent = dateTimeString;
    }
  } catch (err) {
    console.error("Error updating current date time:", err);
  }
}

function setupForm() {
  const form = document.getElementById("attendanceForm");
  const messageDiv = document.getElementById("message");
  
  if (!form || !messageDiv) {
    console.error("Form elements not found");
    return;
  }
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const rollNo = document.getElementById("rollNo").value;
    const studentName = document.getElementById("studentName").value;
    const status = document.getElementById("status").value;
    
    if (!rollNo || !studentName || !status) {
      messageDiv.innerHTML = `<div class="error">❌ Please fill in all fields</div>`;
      return;
    }
    
    try {
      const response = await fetch("/mark_attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: parseInt(rollNo),
          name: studentName,
          status: status
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        const submissionTime = new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        messageDiv.innerHTML = `<div class="success">✅ ${result.message}<br><small>Submitted on: ${submissionTime}</small></div>`;
        form.reset();
        // Refresh the attendance list
        setTimeout(loadAttendance, 500); // Small delay to ensure backend is updated
      } else {
        messageDiv.innerHTML = `<div class="error">❌ ${result.error || 'Unknown error occurred'}</div>`;
      }
    } catch (error) {
      messageDiv.innerHTML = `<div class="error">❌ Network Error: ${error.message}</div>`;
      console.error("Form submission error:", error);
    }
  });
}

// Handle Download Excel button
document.addEventListener("DOMContentLoaded", function() {
  const excelBtn = document.getElementById("excelBtn");
  const pdfBtn = document.getElementById("pdfBtn");
  
  if (excelBtn) {
    excelBtn.addEventListener("click", () => {
      window.location.href = "/generate_report?export=csv";
    });
  }
  
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      window.location.href = "/generate_report?export=pdf";
    });
  }
});
