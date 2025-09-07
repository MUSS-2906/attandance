// Client-side storage for GitHub Pages
let attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || {};

function loadAttendance() {
  const summaryText = document.getElementById("summaryText");
  const tbody = document.getElementById("attendanceBody");

  // Clear old content
  summaryText.textContent = "Loading...";
  tbody.innerHTML = "";

  try {
    // Calculate summary statistics
    let present = 0, absent = 0, totalStudents = Object.keys(attendanceData).length;
    
    for (const studentId in attendanceData) {
      attendanceData[studentId].forEach(record => {
        if (record.status === "Present") present++;
        if (record.status === "Absent") absent++;
      });
    }

    // Show summary
    const reportText = `Attendance Report – ${new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})} | Total Students: ${totalStudents} | Present: ${present} | Absent: ${absent}`;
    summaryText.textContent = reportText;

    // Fill table with student data
    if (totalStudents === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">⚠️ No attendance records yet</td>`;
      tbody.appendChild(tr);
    } else {
      for (const studentId in attendanceData) {
        attendanceData[studentId].forEach(record => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${studentId}</td>
            <td>${record.name}</td>
            <td>${record.status}</td>
            <td>${record.readable_timestamp}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  } catch (err) {
    summaryText.textContent = `⚠️ Error loading data: ${err.message}`;
  }
}

// Real-time clock
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
  
  const dateTimeString = now.toLocaleDateString('en-US', options);
  const currentDateTimeElement = document.getElementById('currentDateTime');
  if (currentDateTimeElement) {
    currentDateTimeElement.textContent = dateTimeString;
  }
}

function setupForm() {
  const form = document.getElementById("attendanceForm");
  const messageDiv = document.getElementById("message");
  
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const rollNo = document.getElementById("rollNo").value;
    const studentName = document.getElementById("studentName").value;
    const status = document.getElementById("status").value;
    
    if (!rollNo || !studentName || !status) {
      messageDiv.innerHTML = `<div class="error">❌ Please fill in all fields</div>`;
      return;
    }
    
    // Add to local storage
    const now = new Date();
    const record = {
      name: studentName,
      status: status,
      date: now.toISOString().split('T')[0],
      readable_timestamp: now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      timestamp: now.toISOString()
    };
    
    if (!attendanceData[rollNo]) {
      attendanceData[rollNo] = [];
    }
    
    attendanceData[rollNo].push(record);
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    
    messageDiv.innerHTML = `<div class="success">✅ Attendance marked for ${studentName} (Roll No: ${rollNo})</div>`;
    form.reset();
    loadAttendance(); // Refresh display
  });
}

// Export to CSV
function exportToCSV() {
  let csvContent = "Roll No,Name,Status,Date,Timestamp\n";
  
  for (const studentId in attendanceData) {
    attendanceData[studentId].forEach(record => {
      csvContent += `${studentId},${record.name},${record.status},${record.date},${record.readable_timestamp}\n`;
    });
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'attendance_report.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Initialize
window.onload = function() {
  loadAttendance();
  setupForm();
  updateCurrentDateTime();
  setInterval(updateCurrentDateTime, 1000);
};

// Event listeners
document.addEventListener("DOMContentLoaded", function() {
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");
  
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all attendance data?")) {
        localStorage.removeItem('attendanceData');
        attendanceData = {};
        loadAttendance();
      }
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener("click", exportToCSV);
  }
});

