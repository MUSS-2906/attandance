import csv
import os
from flask import Flask, request, jsonify, send_file
from datetime import datetime

app = Flask(__name__)

# In-memory storage
attendance_db = {}  # {student_id: [{"date": "...", "status": "..."}]}

@app.route('/')
def home():
    # Serve the index.html file
    with open('index.html', 'r') as f:
        content = f.read()
    response = app.response_class(
        response=content,
        status=200,
        mimetype='text/html',
        headers={'Cache-Control': 'no-cache'}
    )
    return response

@app.route('/style.css')
def serve_css():
    with open('style.css', 'r') as f:
        content = f.read()
    response = app.response_class(
        response=content,
        status=200,
        mimetype='text/css',
        headers={'Cache-Control': 'no-cache'}
    )
    return response

@app.route('/script.js')
def serve_js():
    with open('script.js', 'r') as f:
        content = f.read()
    response = app.response_class(
        response=content,
        status=200,
        mimetype='application/javascript',
        headers={'Cache-Control': 'no-cache'}
    )
    return response

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    data = request.get_json()
    student_id = data.get("student_id")
    name = data.get("name")
    status = data.get("status")
    
    if not student_id or not status or not name:
        return jsonify({"error": "student_id, name, and status required"}), 400
    
    date = datetime.now().strftime("%Y-%m-%d")
    
    if student_id not in attendance_db:
        attendance_db[student_id] = []
    
    # Add attendance record with name
    attendance_db[student_id].append({
        "date": date, 
        "status": status,
        "name": name
    })
    
    return jsonify({"message": f"Attendance marked for {name} (Roll No: {student_id})", "status": status})

@app.route('/get_attendance', methods=['GET'])
def get_attendance():
    student_id = request.args.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id required"}), 400
    
    student_id = int(student_id)
    records = attendance_db.get(student_id, [])
    
    return jsonify({"student_id": student_id, "attendance": records})

@app.route('/generate_report', methods=['GET'])
def generate_report():
    # Optional query param: ?export=csv
    export_csv = request.args.get("export", "false").lower() == "csv"
    
    # Calculate summary statistics
    present = sum(len([r for r in records if r["status"]=="Present"]) for records in attendance_db.values())
    absent = sum(len([r for r in records if r["status"]=="Absent"]) for records in attendance_db.values())
    
    # Build summary and detailed attendance
    report_data = {
        "report": f"Attendance Report – {datetime.now().strftime('%B %Y')}",
        "total_students": len(attendance_db),
        "present": present,
        "absent": absent,
        "students": {}  # detailed attendance per student
    }
    
    for student_id, records in attendance_db.items():
        report_data["students"][student_id] = records
    
    if export_csv:
        csv_file = "attendance_report.csv"
        with open(csv_file, mode="w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Student ID", "Date", "Status", "Name"])
            for student_id, records in attendance_db.items():
                for r in records:
                    writer.writerow([student_id, r["date"], r["status"], r.get("name", "")])
        return send_file(csv_file, as_attachment=True)
    
    return jsonify(report_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
