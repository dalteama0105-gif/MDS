<?php
session_start();
// Security Check
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    // If logged in as user, redirect to display
    if (isset($_SESSION['user_id'])) {
        header("Location: display.php");
    } else {
        header("Location: login.html");
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MDS - Super Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/admin.css">
</head>

<body>

    <header>
        <div class="brand">MDS Admin Portal</div>
        <div class="user-info">
            <span>Hello,
                <?php echo htmlspecialchars($_SESSION['username']); ?>
            </span>
            <button class="btn-logout" onclick="logout()">Logout</button>
        </div>
    </header>

    <main>
        <h1>System Overview</h1>

        <div class="data-table-container">
            <div class="table-header">
                <h2>User Management</h2>
                <button class="btn-primary" onclick="openModal()">+ Add User</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="user-table-body">
                    <!-- Populated by JS -->
                    <tr>
                        <td colspan="5">Loading...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Add User Modal -->
    <div id="add-user-modal" class="modal">
        <div class="modal-content">
            <h2 style="margin-top:0;">Create New User</h2>
            <form id="add-user-form" onsubmit="handleCreateUser(event)">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="new-username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="new-password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <select id="new-role" class="form-control">
                        <option value="user">Standard User</option>
                        <option value="admin">Super Admin</option>
                    </select>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn-logout" style="border:none;" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary">Create Account</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // --- Logic ---
        document.addEventListener('DOMContentLoaded', fetchUsers);

        function fetchUsers() {
            fetch('php/admin_handler.php?action=get_users')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        renderTable(data.data);
                    } else {
                        alert('Error loading users');
                    }
                })
                .catch(err => console.error(err));
        }

        function renderTable(users) {
            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';

            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${user.id}</td>
                    <td>${user.username}</td>
                    <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                    <td>${user.created_at}</td>
                    <td>
                        <button class="btn-delete" onclick="deleteUser(${user.id}, '${user.username}')">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function handleCreateUser(e) {
            e.preventDefault();
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const role = document.getElementById('new-role').value;

            fetch('php/admin_handler.php?action=add_user', {
                method: 'POST',
                body: JSON.stringify({ username, password, role }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        closeModal();
                        fetchUsers(); // Refresh
                        document.getElementById('add-user-form').reset();
                    } else {
                        alert(data.message);
                    }
                });
        }

        function deleteUser(id, name) {
            if (!confirm(`Are you sure you want to delete user '${name}'?`)) return;

            fetch('php/admin_handler.php?action=delete_user', {
                method: 'POST',
                body: JSON.stringify({ id }),
                headers: { 'Content-Type': 'application/json' }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        fetchUsers();
                    } else {
                        alert(data.message);
                    }
                });
        }

        function logout() {
            fetch('php/auth.php?action=logout')
                .then(() => window.location.href = 'login.html');
        }

        // --- Modal UI ---
        function openModal() {
            document.getElementById('add-user-modal').classList.add('active');
        }
        function closeModal() {
            document.getElementById('add-user-modal').classList.remove('active');
        }
    </script>
</body>

</html>