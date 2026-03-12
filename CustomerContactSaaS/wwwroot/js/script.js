// Khởi tạo các Modal
const customerModal = new bootstrap.Modal(document.getElementById('customerModal'));
const msgBoxModal = new bootstrap.Modal(document.getElementById('msgBoxModal'));
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));

// Hệ thống Hiển thị Thông báo thay cho alert()
function showAlert(msg, isSuccess = true) {
    document.getElementById('msgBoxText').innerText = msg;
    const icon = document.getElementById('msgBoxIcon');
    if(isSuccess) {
        icon.className = 'fas fa-check-circle text-success mb-3';
        document.getElementById('msgBoxText').className = 'mb-4 fw-medium text-dark text-start';
    } else {
        icon.className = 'fas fa-exclamation-circle text-danger mb-3';
        document.getElementById('msgBoxText').className = 'mb-4 fw-medium text-danger text-center';
    }
    msgBoxModal.show();
}

// Hệ thống Hiển thị Xác nhận thay cho confirm()
let confirmActionCallback = null;
document.getElementById('btnConfirmAction').addEventListener('click', () => {
    if(confirmActionCallback) confirmActionCallback();
    confirmModal.hide();
});
function showConfirm(callback) {
    confirmActionCallback = callback;
    confirmModal.show();
}

// Dữ liệu mẫu (Giả lập RDS Database)
let customers = [
    { id: 1, name: "Nguyễn Văn A", phone: "0901234567", email: "nguyenvana@example.com", address: "Quận 1, TP.HCM" },
    { id: 2, name: "Trần Thị B", phone: "0912345678", email: "tranthib@example.com", address: "Cầu Giấy, Hà Nội" },
    { id: 3, name: "Lê Hoàng C", phone: "0987654321", email: "lehoangc@example.com", address: "Hải Châu, Đà Nẵng" },
    { id: 4, name: "Phạm Văn D", phone: "0909999888", email: "phamvand@example.com", address: "Ninh Kiều, Cần Thơ" }
];

let selectedIds = [];
let searchTerm = '';

// Lắng nghe sự kiện tìm kiếm
document.getElementById('searchInput').addEventListener('input', function(e) {
    searchTerm = e.target.value.toLowerCase();
    renderTable();
});

// Lắng nghe sự kiện chuyển đổi loại tin nhắn (Email / SMS)
document.querySelectorAll('input[name="msgType"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const isSMS = this.value === 'SMS';
        document.getElementById('subjectWrapper').style.display = isSMS ? 'none' : 'block';
        document.getElementById('contentLabel').innerText = isSMS ? 'Nội dung tin nhắn SMS' : 'Nội dung Email';
    });
});

// Hàm Render Bảng dữ liệu
function renderTable() {
    const tbody = document.getElementById('customerTableBody');
    tbody.innerHTML = '';
    
    // Lọc dữ liệu theo từ khóa tìm kiếm
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.email.toLowerCase().includes(searchTerm) || 
        c.phone.includes(searchTerm)
    );

    document.getElementById('totalCustomers').innerText = customers.length;

    if (filteredCustomers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Không tìm thấy khách hàng nào.</td></tr>`;
    } else {
        filteredCustomers.forEach(c => {
            const isSelected = selectedIds.includes(c.id);
            const tr = document.createElement('tr');
            if (isSelected) tr.classList.add('table-row-selected');
            
            tr.innerHTML = `
                <td class="ps-4">
                    <input class="form-check-input custom-checkbox" type="checkbox" 
                           ${isSelected ? 'checked' : ''} onchange="toggleSelect(${c.id})">
                </td>
                <td>
                    <div class="contact-info">
                        <span class="name">${c.name}</span>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <span class="detail"><i class="fas fa-envelope me-1 text-muted"></i> ${c.email}</span>
                        <span class="detail"><i class="fas fa-phone-alt me-1 text-muted"></i> ${c.phone}</span>
                    </div>
                </td>
                <td class="text-secondary" style="font-size: 0.85rem;">${c.address}</td>
                <td class="text-end pe-4">
                    <button class="action-btn" onclick="openCustomerModal(${c.id})" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteCustomer(${c.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    updatePanelStatus();
}

// Xử lý Tick chọn 1 khách hàng
window.toggleSelect = function(id) {
    if (selectedIds.includes(id)) {
        selectedIds = selectedIds.filter(itemId => itemId !== id);
    } else {
        selectedIds.push(id);
    }
    renderTable();
}

// Xử lý Tick Chọn Tất Cả
window.toggleSelectAll = function(isChecked) {
    if (isChecked) {
        // Chỉ chọn những khách hàng đang hiển thị (sau khi search)
        const filteredCustomers = customers.filter(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.email.toLowerCase().includes(searchTerm) || 
            c.phone.includes(searchTerm)
        );
        selectedIds = filteredCustomers.map(c => c.id);
    } else {
        selectedIds = [];
    }
    renderTable();
}

// Cập nhật trạng thái Khung Gửi Thông Báo bên phải
function updatePanelStatus() {
    const count = selectedIds.length;
    const badge = document.getElementById('selectedBadge');
    const btnSend = document.getElementById('btnSend');
    const panelBox = document.getElementById('sendPanelBox');

    badge.innerText = `Đã chọn: ${count}`;
    
    // Cập nhật Checkbox "Chọn tất cả" trên Header bảng
    const visibleCount = customers.filter(c => c.name.toLowerCase().includes(searchTerm)).length;
    document.getElementById('checkAll').checked = (count > 0 && count === visibleCount);

    if (count > 0) {
        badge.classList.replace('bg-opacity-10', 'bg-opacity-100');
        badge.classList.replace('text-primary', 'text-white');
        badge.style.backgroundColor = '#3b82f6';
        
        btnSend.removeAttribute('disabled');
        btnSend.classList.add('btn-send-active');
        panelBox.classList.add('panel-active');
    } else {
        badge.style.backgroundColor = '#f1f5f9';
        badge.style.color = '#475569';
        badge.classList.replace('bg-opacity-100', 'bg-opacity-10');
        
        btnSend.setAttribute('disabled', 'true');
        btnSend.classList.remove('btn-send-active');
        panelBox.classList.remove('panel-active');
    }
}

// Xóa khách hàng
window.deleteCustomer = function(id) {
    showConfirm(() => {
        customers = customers.filter(c => c.id !== id);
        selectedIds = selectedIds.filter(itemId => itemId !== id);
        renderTable();
    });
}

// Mở Modal Thêm mới / Chỉnh sửa
window.openCustomerModal = function(id = null) {
    const form = document.getElementById('customerForm');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    
    if (id) {
        const c = customers.find(item => item.id === id);
        document.getElementById('custId').value = c.id;
        document.getElementById('custName').value = c.name;
        document.getElementById('custPhone').value = c.phone;
        document.getElementById('custEmail').value = c.email;
        document.getElementById('custAddress').value = c.address;
        title.innerHTML = '<i class="fas fa-edit text-primary me-2"></i> Chỉnh sửa thông tin';
    } else {
        document.getElementById('custId').value = '';
        title.innerHTML = '<i class="fas fa-user-plus text-primary me-2"></i> Thêm Khách hàng mới';
    }
    customerModal.show();
}

// Lưu dữ liệu Thêm/Sửa
document.getElementById('customerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('custId').value;
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const email = document.getElementById('custEmail').value;
    const address = document.getElementById('custAddress').value;

    if (id) {
        // Mode: Chỉnh sửa
        const index = customers.findIndex(c => c.id == id);
        customers[index] = { id: parseInt(id), name, phone, email, address };
    } else {
        // Mode: Thêm mới
        customers.push({ id: Date.now(), name, phone, email, address });
    }
    
    renderTable();
    customerModal.hide();
});


// Khởi động
renderTable();