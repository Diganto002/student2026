(function () {
  "use strict";

  const form = document.getElementById("registrationForm");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");

  const fields = {
    firstName: document.getElementById("firstName"),
    lastName: document.getElementById("lastName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    dob: document.getElementById("dob"),
    gender: document.getElementById("gender"),
    course: document.getElementById("course"),
    address: document.getElementById("address"),
  };

  const errors = {
    firstName: document.getElementById("firstNameError"),
    lastName: document.getElementById("lastNameError"),
    email: document.getElementById("emailError"),
    phone: document.getElementById("phoneError"),
    dob: document.getElementById("dobError"),
    gender: document.getElementById("genderError"),
    course: document.getElementById("courseError"),
    address: document.getElementById("addressError"),
  };

  // ---------- Validators ----------
  const nameRegex = /^[A-Za-z ]{2,50}$/;

  function validateName(value) {
    const v = value.trim();
    if (!v) return "Name is required.";
    if (v.length < 2 || v.length > 50) return "Name must be 2-50 characters.";
    if (!nameRegex.test(v)) return "Name can contain only letters and spaces.";
    // avoid leading/trailing or double spaces being "valid" content-wise; allow single spaces inside
    if (/\s{2,}/.test(v) || v.startsWith(" ") || v.endsWith(" ")) {
      return "Name cannot have leading/trailing or multiple spaces.";
    }
    return "";
  }

  function validateEmail(value) {
    const v = value.trim();
    if (!v) return "Email is required.";
    // RFC-ish simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(v)) return "Please enter a valid email address.";
    return "";
  }

  function validatePhone(value) {
    const v = value.trim();
    if (!v) return "Phone number is required.";
    if (!/^\d{11}$/.test(v)) return "Phone number must be exactly 11 digits.";
    return "";
  }

  function validateDob(value) {
    if (!value) return "Date of birth is required.";
    const dob = new Date(value);
    if (isNaN(dob.getTime())) return "Please enter a valid date.";
    const today = new Date();
    // normalize to midnight
    today.setHours(0, 0, 0, 0);
    dob.setHours(0, 0, 0, 0);
    if (dob > today) return "Date of birth cannot be in the future.";
    // age calculation
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < 16) return "You must be at least 16 years old.";
    return "";
  }

  function validateGender(value) {
    if (!value) return "Please select a gender.";
    return "";
  }

  function validateCourse(value) {
    const v = value.trim();
    if (!v) return "Course name is required.";
    if (v.length < 2) return "Course name is too short.";
    return "";
  }

  function validateAddress(value) {
    const v = value.trim();
    if (!v) return "Address is required.";
    if (v.length < 5) return "Please enter a complete address.";
    return "";
  }

  const validators = {
    firstName: validateName,
    lastName: validateName,
    email: validateEmail,
    phone: validatePhone,
    dob: validateDob,
    gender: validateGender,
    course: validateCourse,
    address: validateAddress,
  };

  // ---------- UI helpers ----------
  function setError(key, message) {
    const fieldEl = fields[key].closest(".field");
    if (message) {
      fieldEl.classList.add("error");
      errors[key].textContent = message;
    } else {
      fieldEl.classList.remove("error");
      errors[key].textContent = "";
    }
  }

  function validateField(key) {
    const value = fields[key].value;
    const msg = validators[key](value);
    setError(key, msg);
    return msg === "";
  }

  function validateAll() {
    let ok = true;
    Object.keys(fields).forEach((key) => {
      if (!validateField(key)) ok = false;
    });
    return ok;
  }

  // Live validation on blur; clear on input
  Object.keys(fields).forEach((key) => {
    const el = fields[key];
    el.addEventListener("blur", () => validateField(key));
    el.addEventListener("input", () => {
      // only clear error if currently invalid? keep simple: re-validate silently-ish
      if (el.closest(".field").classList.contains("error")) {
        validateField(key);
      }
    });
  });

  // Phone: restrict to digits only
  fields.phone.addEventListener("input", () => {
    fields.phone.value = fields.phone.value.replace(/\D/g, "").slice(0, 11);
  });

  // Name: strip invalid chars as typing (optional gentle)
  ["firstName", "lastName"].forEach((k) => {
    fields[k].addEventListener("input", () => {
      // allow letters and spaces only
      fields[k].value = fields[k].value.replace(/[^A-Za-z ]/g, "");
    });
  });

  // ---------- Modal ----------
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalOk = document.getElementById("modalOk");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const responseCard = document.getElementById("responseCard");
  const modalIcon = document.getElementById("modalIcon");

  function openModal(data) {
    modalTitle.textContent = "Registration Successful!";
    modalMessage.textContent = "Your details have been submitted successfully.";
    modalIcon.className = "modal-icon success";
    modalIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    const rows = [
      ["First Name", data.firstName],
      ["Last Name", data.lastName],
      ["Email", data.email],
      ["Phone", data.phone],
      ["Date of Birth", data.dob],
      ["Age", data.age + " years"],
      ["Gender", data.gender],
      ["Course", data.course],
      ["Address", data.address],
    ];
    responseCard.innerHTML = rows
      .map(([l, v]) => `<div class="response-row"><span class="label">${escapeHtml(l)}</span><span class="value">${escapeHtml(String(v))}</span></div>`)
      .join("");

    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
  }
  modalClose.addEventListener("click", closeModal);
  modalOk.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function calcAge(dobStr) {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  // ---------- Submit ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateAll()) {
      // focus first invalid
      const firstInvalid = Object.keys(fields).find((k) =>
        fields[k].closest(".field").classList.contains("error")
      );
      if (firstInvalid) fields[firstInvalid].focus();
      return;
    }

    const data = {
      firstName: fields.firstName.value.trim(),
      lastName: fields.lastName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      dob: fields.dob.value,
      gender: fields.gender.value,
      course: fields.course.value.trim(),
      address: fields.address.value.trim(),
    };
    data.age = calcAge(data.dob);

    // Simulate submission success
    openModal(data);
    // Optionally reset form after showing? Keep data; reset on close? We'll reset on Done.
  });

  modalOk.addEventListener("click", () => {
    form.reset();
    Object.keys(fields).forEach((k) => setError(k, ""));
  }, { once: false });

  // Reset button clears errors
  resetBtn.addEventListener("click", () => {
    setTimeout(() => Object.keys(fields).forEach((k) => setError(k, "")), 0);
  });
})();