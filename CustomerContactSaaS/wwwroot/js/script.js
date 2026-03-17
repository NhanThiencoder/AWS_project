// --- KHỞI TẠO ---
document.getElementById('currentDate').innerText = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
const avatarSelectorModal = new bootstrap.Modal(document.getElementById('avatarSelectorModal'));
const msgBoxModal = new bootstrap.Modal(document.getElementById('msgBoxModal'));

const predefinedAvatars = [
    "https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/micah/svg?seed=Aneka&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/micah/svg?seed=Mia&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/micah/svg?seed=Oliver&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/micah/svg?seed=Abby&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/micah/svg?seed=Sadie&backgroundColor=ffdfbf",
    "https://api.dicebear.com/7.x/micah/svg?seed=Leo&backgroundColor=d1d4f9",
    "https://api.dicebear.com/7.x/micah/svg?seed=Zoe&backgroundColor=b6e3f4",
    "https://api.dicebear.com/7.x/micah/svg?seed=Max&backgroundColor=c0aede",
    "https://api.dicebear.com/7.x/micah/svg?seed=Lily&backgroundColor=ffdfbf",
    "null"
];

let tempSelectedAvatar = null;
let selectedIds = [];
let searchTerm = '';

// --- CÁC HÀM TIỆN ÍCH UI ---
function showAlert(msg, isSuccess = true) {
    document.getElementById('msgBoxText').innerText = msg;
    document.getElementById('msgBoxIcon').className = isSuccess ? 'fas fa-check-circle text-success mb-4' : 'fas fa-exclamation-circle text-danger mb-4';
    msgBoxModal.show();
}

function getInitials(name) {
    if (!name) return "?";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getColorByName(name) {
    const colors = ['#fca5a5', '#c084fc', '#93c5fd', '#6ee7b7', '#fcd34d', '#f472b6'];
    let hash = 0;
    if (!name) return colors[0];
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

function setAwsMode(mode) {
    document.getElementById('awsMode').value = mode;
    document.getElementById('tabSES').classList.toggle('active', mode === 'SES');
    document.getElementById('tabSNS').classList.toggle('active', mode === 'SNS');
    document.getElementById('subjectWrapper').style.display = mode === 'SES' ? 'block' : 'none';
    document.getElementById('contentLabel').innerText = mode === 'SES' ? 'Nội dung Email' : 'Nội dung SMS';
}

// --- RENDER BẢNG DỮ LIỆU ---
document.getElementById('searchInput').addEventListener('input', e => { searchTerm = e.target.value.toLowerCase(); renderTable(); });

function renderTable() {
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm) || c.email.toLowerCase().includes(searchTerm) || c.phone.includes(searchTerm)
    );

    document.getElementById('statTotal').innerText = customers.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted"><i class="fas fa-box-open fa-3x mb-3"></i><br>Không tìm thấy khách hàng.</td></tr>`;
    } else {
        filtered.forEach(c => {
            const isSelected = selectedIds.includes(c.id);
            const bgColor = getColorByName(c.name);
            const avatarContent = c.avatar ? `<img src="${c.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : `${getInitials(c.name)}`;

            const tr = document.createElement('tr');
            if (isSelected) tr.style.backgroundColor = '#f8faff'; // Đổi màu nền khi tick chọn

            // Xử lý click nguyên hàng (row) để tick ô checkbox
            tr.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && !e.target.closest('button')) toggleSelect(c.id);
            };
            tr.style.cursor = 'pointer';

            tr.innerHTML = `
                <td class="ps-4">
                    <input class="form-check-input border-secondary" type="checkbox" style="width: 1.2rem; height: 1.2rem;" ${isSelected ? 'checked' : ''} onchange="toggleSelect(${c.id})">
                </td>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <div style="width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; background-color: ${c.avatar ? 'transparent' : bgColor};">
                            ${avatarContent}
                        </div>
                        <div>
                            <div class="fw-bold text-dark" style="font-size: 0.95rem;">${c.name}</div>
                            <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">${c.role || 'Khách hàng'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; margin-bottom: 4px;"><i class="fas fa-envelope text-muted me-2"></i>${c.email}</div>
                    <div style="font-size: 0.85rem;"><i class="fas fa-phone-alt text-muted me-2"></i>${c.phone}</div>
                </td>
                <td style="font-size: 0.85rem; color: #475569;">${c.address}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm" style="background-color: #eff4ff; color: #4318ff; border-radius: 8px; font-weight: 600;" onclick="openCustomerModal(${c.id}); event.stopPropagation();"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm ms-1" style="background-color: #fee2e2; color: #ef4444; border-radius: 8px; font-weight: 600;" onclick="deleteCustomer(${c.id}); event.stopPropagation();"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    updatePanelStatus();
}

function toggleSelect(id) {
    if (selectedIds.includes(id)) selectedIds = selectedIds.filter(itemId => itemId !== id);
    else selectedIds.push(id);
    renderTable();
}

window.toggleSelectAll = function () {
    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm) || c.email.toLowerCase().includes(searchTerm));
    if (selectedIds.length === filtered.length && filtered.length > 0) selectedIds = [];
    else selectedIds = filtered.map(c => c.id);
    renderTable();
}

function updatePanelStatus() {
    const count = selectedIds.length;
    document.getElementById('statSelected').innerText = count;
    document.getElementById('btnSendCount').innerText = count;

    const btnSend = document.getElementById('btnSend');
    if (count > 0) { btnSend.removeAttribute('disabled'); btnSend.classList.add('active'); }
    else { btnSend.setAttribute('disabled', 'true'); btnSend.classList.remove('active'); }

    const filteredLen = customers.filter(c => c.name.toLowerCase().includes(searchTerm)).length;
    const btnSelectAll = document.getElementById('btnSelectAll');
    if (count > 0 && count === filteredLen) btnSelectAll.innerHTML = '<i class="far fa-square me-2 text-muted"></i> Bỏ chọn tất cả';
    else btnSelectAll.innerHTML = '<i class="fas fa-check-square me-2 text-primary"></i> Chọn tất cả';
}

// --- CẬP NHẬT GIAO DIỆN FORM (Avatar Preview) ---
function updateFormAvatarPreview(avatarUrl, name) {
    const previewBox = document.getElementById('formAvatarPreview');
    if (avatarUrl && avatarUrl !== 'null') {
        previewBox.style.backgroundColor = 'transparent';
        previewBox.innerHTML = `<img src="${avatarUrl}" alt="Avatar">`;
    } else {
        const initName = name || 'User';
        previewBox.style.backgroundColor = getColorByName(initName);
        previewBox.innerHTML = getInitials(initName);
    }
    document.getElementById('custAvatar').value = avatarUrl || '';
}

document.getElementById('custName').addEventListener('input', (e) => {
    const currentAvt = document.getElementById('custAvatar').value;
    if (!currentAvt || currentAvt === 'null') updateFormAvatarPreview(null, e.target.value);
});

// --- THÊM / SỬA KHÁCH HÀNG (AJAX) ---
window.openCustomerModal = function (id = null) {
    const form = document.getElementById('customerForm');
    form.reset();

    if (id) {
        const c = customers.find(item => item.id === id);
        document.getElementById('custId').value = c.id;
        document.getElementById('custName').value = c.name;
        document.getElementById('custPhone').value = c.phone;
        document.getElementById('custEmail').value = c.email;
        document.getElementById('custAddress').value = c.address;
        document.getElementById('custRole').value = c.role || '';
        updateFormAvatarPreview(c.avatar, c.name);
        document.getElementById('modalTitle').innerText = 'Cập nhật Thông tin';
    } else {
        document.getElementById('custId').value = '';
        updateFormAvatarPreview(null, '');
        document.getElementById('modalTitle').innerText = 'Thêm Khách hàng mới';
    }
    customerModal.show();
}

document.getElementById('customerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('custId').value;

    const customerData = {
        Id: id ? parseInt(id) : 0,
        FullName: document.getElementById('custName').value,
        PhoneNumber: document.getElementById('custPhone').value,
        EmailAddress: document.getElementById('custEmail').value,
        Address: document.getElementById('custAddress').value
    };

    const url = id ? '/Customer/EditAjax' : '/Customer/CreateAjax';

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(id ? "Cập nhật dữ liệu thành công!" : "Đã thêm khách hàng mới vào Database!");

                let avatarVal = document.getElementById('custAvatar').value;
                if (avatarVal === 'null' || avatarVal === '') avatarVal = null;
                const extraData = { role: document.getElementById('custRole').value, avatar: avatarVal };

                if (id) {
                    const index = customers.findIndex(c => c.id == id);
                    customers[index] = { id: parseInt(id), name: customerData.FullName, phone: customerData.PhoneNumber, email: customerData.EmailAddress, address: customerData.Address, ...extraData };
                } else {
                    customers.push({ id: data.newId, name: customerData.FullName, phone: customerData.PhoneNumber, email: customerData.EmailAddress, address: customerData.Address, ...extraData });
                }
                renderTable(); // Gọi lại hàm vẽ Bảng
                customerModal.hide();
            } else {
                showAlert("Lỗi: " + data.message, false);
            }
        })
        .catch(error => showAlert('Lỗi kết nối Server: ' + error, false));
});

// --- XỬ LÝ CHỌN AVATAR ---
window.openAvatarSelector = function () {
    tempSelectedAvatar = document.getElementById('custAvatar').value || 'null';
    renderAvatarOptions();
    avatarSelectorModal.show();
}

function renderAvatarOptions() {
    const container = document.getElementById('avatarOptionsContainer');
    container.innerHTML = '';
    predefinedAvatars.forEach(avtUrl => {
        const opt = document.createElement('div');
        opt.className = `avatar-option ${tempSelectedAvatar === avtUrl ? 'selected' : ''}`;
        if (avtUrl === 'null') {
            opt.classList.add('upload-btn');
            opt.innerHTML = '<i class="fas fa-plus"></i>';
        } else {
            opt.innerHTML = `<img src="${avtUrl}" alt="Avatar Option">`;
        }
        opt.onclick = () => { tempSelectedAvatar = avtUrl; renderAvatarOptions(); };
        container.appendChild(opt);
    });
}

window.confirmAvatarSelection = function () {
    const currentName = document.getElementById('custName').value;
    updateFormAvatarPreview(tempSelectedAvatar, currentName);
    avatarSelectorModal.hide();
}

// --- XÓA (AJAX) ---
window.deleteCustomer = function (id) {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này khỏi hệ thống? Dữ liệu sẽ mất vĩnh viễn!")) {
        fetch(`/Customer/DeleteAjax/${id}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    customers = customers.filter(c => c.id !== id);
                    selectedIds = selectedIds.filter(itemId => itemId !== id);
                    renderTable(); // Gọi lại hàm vẽ Bảng
                    showAlert("Đã xóa khách hàng khỏi Database thành công!");
                } else {
                    showAlert("Lỗi khi xóa: " + data.message, false);
                }
            });
    }
}

// --- GỌI API AWS THẬT ---
document.getElementById('btnSend').addEventListener('click', function () {
    const mode = document.getElementById('awsMode').value;
    const subject = document.getElementById('msgSubject').value;
    const content = document.getElementById('msgContent').value;

    if (mode === 'SES' && !subject.trim()) return showAlert('Lỗi: AWS SES yêu cầu Tiêu đề Email.', false);
    if (!content.trim()) return showAlert('Lỗi: Nội dung tin nhắn không được để trống.', false);
    if (selectedIds.length === 0) return showAlert('Lỗi: Vui lòng chọn ít nhất 1 khách hàng.', false);

    // Lưu lại UI gốc của nút Gửi
    const btnSend = document.getElementById('btnSend');
    const originalText = btnSend.innerHTML;

    // Đổi nút thành trạng thái Loading
    btnSend.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Đang kết nối AWS...';
    btnSend.disabled = true;

    // Gọi AJAX về CommunicationController
    fetch('/Communication/SendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Mode: mode,
            Subject: subject,
            Content: content,
            SelectedCustomerIds: selectedIds
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert(data.message, true);
                document.getElementById('sendMessageForm').reset();
                selectedIds = [];
            } else {
                showAlert(data.message, false);
            }
        })
        .catch(error => showAlert('Lỗi hệ thống: ' + error, false))
        .finally(() => {
            // Bước 1: Trả lại nút Gửi như cũ (Khôi phục thẻ span bị mất)
            btnSend.innerHTML = originalText;

            // Bước 2: Bây giờ thẻ span đã tồn tại, ta mới cập nhật bảng an toàn
            renderTable();
        });
});

// Khởi động
renderTable();

// Khởi động
renderTable();