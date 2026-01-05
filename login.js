// ========================================================
// SWITCH BETWEEN LOGIN & REGISTER FORMS
// ========================================================
function showForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.remove('tab-active');
    registerTab.classList.remove('tab-active');

    if (formType === 'login') {
        loginForm.classList.remove('hidden');
        loginTab.classList.add('tab-active');
    } else {
        registerForm.classList.remove('hidden');
        registerTab.classList.add('tab-active');
    }
}


// ========================================================
// INPUT ERROR HANDLER
// ========================================================
function toggleError(inputElement, errorElement, isInvalid) {
    inputElement.classList.toggle('border-red-500', isInvalid);
    inputElement.classList.toggle('border-gray-300', !isInvalid);
    errorElement.classList.toggle('hidden', !isInvalid);

    if (isInvalid) {
        const parent = inputElement.parentElement;
        parent.classList.add('animate-shake');
        parent.addEventListener('animationend', () => 
            parent.classList.remove('animate-shake'), { once: true });
    }
}


// ========================================================
// 🔥 BACKEND LOGIN API CALL
// ========================================================
async function loginUserBackend(email, password) {
    try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) return null;
        return await res.json();

    } catch (err) {
        console.error("Login API error:", err);
        return null;
    }
}


// ========================================================
// 🔥 LOGIN VALIDATION + API INTEGRATION
// ========================================================
async function validateLogin(event) {
    event.preventDefault();
    let isValid = true;

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    // Validate fields
    if (emailInput.value.trim() === '') {
        toggleError(emailInput, emailError, true);
        emailError.textContent = 'Email is required';
        isValid = false;
    } else toggleError(emailInput, emailError, false);

    if (passwordInput.value === '') {
        toggleError(passwordInput, passwordError, true);
        passwordError.textContent = 'Password is required';
        isValid = false;
    } else toggleError(passwordInput, passwordError, false);

    if (!isValid) return;

    // 🔥 Send login request to backend
    const apiRes = await loginUserBackend(emailInput.value.trim(), passwordInput.value);

    if (!apiRes) {
        toggleError(emailInput, emailError, true);
        toggleError(passwordInput, passwordError, true);
        emailError.textContent = "Invalid email or password!";
        return;
    }

    // apiRes expected to be { token, user }
    if (!apiRes.token || !apiRes.user) {
        toggleError(emailInput, emailError, true);
        toggleError(passwordInput, passwordError, true);
        emailError.textContent = "Invalid server response";
        return;
    }

    // persist token + user
    localStorage.setItem("jwtToken", apiRes.token);
    localStorage.setItem("user", JSON.stringify(apiRes.user));

    // Redirect by role (user.role)
    const role = apiRes.user.role;
    if (role === 'patient') window.location.href = 'patient_dashboard.html';
    else if (role === 'staff') window.location.href = 'staff_dashboard.html';
    else if (role === 'admin') window.location.href = 'admin_dashboard.html';
    else alert('Unknown role: ' + role);
}


// ========================================================
// 🔥 BACKEND REGISTRATION API CALL
// ========================================================
async function registerUserBackend(userObj) {
    try {
        const res = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userObj)
        });

        return res.ok;
    } catch (err) {
        console.error("Registration failed:", err);
        return false;
    }
}


// ========================================================
// 🔥 VALIDATE REGISTER + SEND TO BACKEND
// ========================================================
async function validateRegister(event) {
    event.preventDefault();
    let isValid = true;

    const fields = {
        name: ["register-name", "register-name-error"],
        email: ["register-email", "register-email-error"],
        phone: ["register-phone", "register-phone-error"],
        role: ["register-role", "register-role-error"],
        password: ["register-password", "register-password-error"],
        confirmPassword: ["register-confirm-password", "register-confirm-password-error"]
    };

    const nameInput = document.getElementById(fields.name[0]);
    const emailInput = document.getElementById(fields.email[0]);
    const phoneInput = document.getElementById(fields.phone[0]);
    const roleSelect = document.getElementById(fields.role[0]);
    const passwordInput = document.getElementById(fields.password[0]);
    const confirmPasswordInput = document.getElementById(fields.confirmPassword[0]);

    // Required validation
    if (nameInput.value.trim() === '') { toggleError(nameInput, document.getElementById(fields.name[1]), true); isValid = false; }
    else toggleError(nameInput, document.getElementById(fields.name[1]), false);

    if (emailInput.value.trim() === '') { toggleError(emailInput, document.getElementById(fields.email[1]), true); isValid = false; }
    else toggleError(emailInput, document.getElementById(fields.email[1]), false);

    if (phoneInput.value.trim() === '') { toggleError(phoneInput, document.getElementById(fields.phone[1]), true); isValid = false; }
    else toggleError(phoneInput, document.getElementById(fields.phone[1]), false);

    if (roleSelect.value === '') { toggleError(roleSelect, document.getElementById(fields.role[1]), true); isValid = false; }
    else toggleError(roleSelect, document.getElementById(fields.role[1]), false);

    if (passwordInput.value === '') { toggleError(passwordInput, document.getElementById(fields.password[1]), true); isValid = false; }
    else toggleError(passwordInput, document.getElementById(fields.password[1]), false);

    if (confirmPasswordInput.value !== passwordInput.value) {
        toggleError(confirmPasswordInput, document.getElementById(fields.confirmPassword[1]), true);
        document.getElementById(fields.confirmPassword[1]).textContent = 'Passwords do not match';
        isValid = false;
    } else toggleError(confirmPasswordInput, document.getElementById(fields.confirmPassword[1]), false);

    if (!isValid) return;

    // Build user object exactly as backend expects
    const userObj = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        role: roleSelect.value,
        password: passwordInput.value
    };

    const success = await registerUserBackend(userObj);

    if (success) {
        alert("Registration successful!");
        showForm("login");
    } else {
        alert("Registration failed. Try again.");
    }
}


// ========================================================
// PASSWORD SHOW/HIDE TOGGLE
// ========================================================
function addPasswordToggles() {
    const pwdSelectors = ['#login-password', '#register-password', '#register-confirm-password'];

    pwdSelectors.forEach(sel => {
        const input = document.querySelector(sel);
        if (!input) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500';
        btn.innerHTML = '👁';

        const parent = input.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(btn);

        btn.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
    });
}


// Note: login is handled by `validateLogin(event)` via the form's onsubmit attribute.


// ========================================================
// INIT
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    showForm('login');
    addPasswordToggles();
    initForgotPassword();
});


// ========================================================
// FORGOT PASSWORD FLOW
// ========================================================
function initForgotPassword() {
    const forgotLink = document.getElementById('forgot-link');
    const modal = document.getElementById('forgot-modal');
    const closeBtn = document.getElementById('fp-close');
    const sendOtpBtn = document.getElementById('fp-send-otp');
    const backBtn = document.getElementById('fp-back');
    const resetBtn = document.getElementById('fp-reset');

    const requestForm = document.getElementById('forgot-request-form');
    const resetForm = document.getElementById('forgot-reset-form');

    forgotLink?.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
        requestForm.classList.remove('hidden');
        resetForm.classList.add('hidden');
    });

    closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));

    sendOtpBtn?.addEventListener('click', async () => {
        const identifier = document.getElementById('fp-identifier').value.trim();
        if (!identifier) return alert('Enter email or phone');

        try {
            const res = await fetch('http://localhost:8080/api/auth/forgot/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier })
            });

            if (!res.ok) {
                const txt = await res.text();
                return alert('Error: ' + txt);
            }

            alert('OTP sent (check email or developer logs for phone OTP)');
            requestForm.classList.add('hidden');
            resetForm.classList.remove('hidden');
        } catch (err) {
            console.error('Send OTP error', err);
            alert('Failed to send OTP');
        }
    });

    backBtn?.addEventListener('click', () => {
        requestForm.classList.remove('hidden');
        resetForm.classList.add('hidden');
    });

    resetBtn?.addEventListener('click', async () => {
        const identifier = document.getElementById('fp-identifier').value.trim();
        const otp = document.getElementById('fp-otp').value.trim();
        const newPassword = document.getElementById('fp-new-password').value;
        const confirm = document.getElementById('fp-confirm-password').value;

        if (!otp || !newPassword || !confirm) return alert('Fill all fields');
        if (newPassword !== confirm) return alert('Passwords do not match');

        try {
            const res = await fetch('http://localhost:8080/api/auth/forgot/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp, newPassword })
            });

            if (!res.ok) {
                const txt = await res.text();
                return alert('Error: ' + txt);
            }

            alert('Password reset successful. Please login with your new password.');
            modal.classList.add('hidden');
        } catch (err) {
            console.error('Reset error', err);
            alert('Failed to reset password');
        }
    });
}
