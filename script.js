const STORAGE_KEY = "student-grade-tracker-students";

let students = loadStudents();

const form = document.getElementById("studentForm");
const nameInput = document.getElementById("studentName");
const gradeInput = document.getElementById("studentGrade");
const errorMessage = document.getElementById("formError");
const tableBody = document.getElementById("studentTableBody");
const averageGrade = document.getElementById("averageGrade");
const emptyState = document.getElementById("emptyState");
const studentCount = document.getElementById("studentCount");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const grade = Number(gradeInput.value);

  if (!name) {
    showError("Student name cannot be empty.");
    nameInput.focus();
    return;
  }

  if (gradeInput.value.trim() === "" || Number.isNaN(grade) || grade < 0 || grade > 100) {
    showError("Grade must be a number between 0 and 100.");
    gradeInput.focus();
    return;
  }

  const student = {
    id: Date.now(),
    name,
    grade
  };

  students.push(student);
  saveStudents();
  renderStudents();
  form.reset();
  nameInput.focus();
});

tableBody.addEventListener("click", function (event) {
  if (!event.target.classList.contains("delete-button")) {
    return;
  }

  const studentId = Number(event.target.dataset.id);
  students = students.filter(function (student) {
    return student.id !== studentId;
  });

  saveStudents();
  renderStudents();
});

function renderStudents() {
  const average = calculateAverage();

  tableBody.innerHTML = "";

  students.forEach(function (student) {
    const row = document.createElement("tr");
    const isAboveAverage = students.length > 1 && student.grade > average;

    if (isAboveAverage) {
      row.classList.add("above-average");
    }

    row.innerHTML = `
      <td>${escapeHtml(student.name)}</td>
      <td>${formatGrade(student.grade)}</td>
      <td>
        <span class="badge ${isAboveAverage ? "badge--above" : ""}">
          ${isAboveAverage ? "Above Average" : "Recorded"}
        </span>
      </td>
      <td>
        <button class="delete-button" type="button" data-id="${student.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  averageGrade.textContent = formatGrade(average);
  emptyState.hidden = students.length > 0;
  studentCount.textContent = `${students.length} ${students.length === 1 ? "student" : "students"}`;
  errorMessage.textContent = "";
}

function calculateAverage() {
  if (students.length === 0) {
    return 0;
  }

  const total = students.reduce(function (sum, student) {
    return sum + student.grade;
  }, 0);

  return total / students.length;
}

function formatGrade(grade) {
  return Number(grade).toFixed(2);
}

function showError(message) {
  errorMessage.textContent = message;
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function loadStudents() {
  const storedStudents = localStorage.getItem(STORAGE_KEY);

  if (!storedStudents) {
    return [];
  }

  try {
    const parsedStudents = JSON.parse(storedStudents);

    if (!Array.isArray(parsedStudents)) {
      return [];
    }

    return parsedStudents.filter(function (student) {
      return (
        typeof student.id === "number" &&
        typeof student.name === "string" &&
        typeof student.grade === "number"
      );
    });
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

renderStudents();
