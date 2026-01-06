// settings.js - load and update profile, change password
async function fetchProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;

    try {
        const res = await fetch('https://hgsbackend-production.up.railway.app/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function updateProfile(data) {
    const token = localStorage.getItem('jwtToken');
    const res = await fetch('https://hgsbackend-production.up.railway.app/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(data)
    });
    return res.ok ? await res.json() : null;
}

async function changePassword(oldPwd, newPwd) {
    const token = localStorage.getItem('jwtToken');
    const res = await fetch('https://hgsbackend-production.up.railway.app/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ oldPassword: oldPwd, newPassword: newPwd })
    });
    return res.ok;
}

function fillForm(user) {
    if (!user) return;
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('role').value = user.role || '';
}

document.addEventListener('DOMContentLoaded', async () => {
    const profile = await fetchProfile();
    if (!profile) { alert('Not authenticated'); return; }
    fillForm(profile);

    document.getElementById('save-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const data = { name: document.getElementById('name').value.trim(), phone: document.getElementById('phone').value.trim() };
        const updated = await updateProfile(data);
        if (updated) { alert('Profile updated'); localStorage.setItem('user', JSON.stringify(updated)); }
        else alert('Update failed');
    });

    document.getElementById('change-pwd-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const oldPwd = document.getElementById('old-password').value;
        const newPwd = document.getElementById('new-password').value;
        const confirm = document.getElementById('confirm-password').value;
        if (!oldPwd || !newPwd) { alert('Fill both fields'); return; }
        if (newPwd !== confirm) { alert('Passwords do not match'); return; }
        const ok = await changePassword(oldPwd, newPwd);
        if (ok) { alert('Password changed'); document.getElementById('old-password').value=''; document.getElementById('new-password').value=''; document.getElementById('confirm-password').value=''; }
        else alert('Password change failed');
    });
});


