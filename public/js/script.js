// ========== DỮ LIỆU MẪU ==========
const sampleData = {
    // Dữ liệu sản phẩm
    products: [
        {
            id: 'SP001',
            name: 'iPhone 15 Pro Max 256GB',
            category: 'iPhone',
            price: 34990000,
            stock: 50,
            supplier: 'Apple Vietnam',
            status: 'active',
            sold: 125,
            revenue: 4373750000
        },
        {
            id: 'SP002',
            name: 'iPhone 14 Plus 128GB',
            category: 'iPhone',
            price: 21990000,
            stock: 30,
            supplier: 'FPT Trading',
            status: 'active',
            sold: 89,
            revenue: 1957110000
        },
        {
            id: 'SP003',
            name: 'Samsung Galaxy S24 Ultra',
            category: 'Samsung',
            price: 31990000,
            stock: 40,
            supplier: 'Samsung Vina',
            status: 'active',
            sold: 67,
            revenue: 2143330000
        },
        {
            id: 'SP004',
            name: 'Samsung Galaxy A54 5G',
            category: 'Samsung',
            price: 8490000,
            stock: 100,
            supplier: 'Samsung Vina',
            status: 'active',
            sold: 215,
            revenue: 1825350000
        },
        {
            id: 'SP005',
            name: 'Xiaomi 14 12GB/256GB',
            category: 'Xiaomi',
            price: 22990000,
            stock: 20,
            supplier: 'Xiaomi VN',
            status: 'active',
            sold: 45,
            revenue: 1034550000
        },
        {
            id: 'SP006',
            name: 'Redmi Note 13 Pro',
            category: 'Xiaomi',
            price: 7290000,
            stock: 80,
            supplier: 'Digiworld',
            status: 'active',
            sold: 178,
            revenue: 1297620000
        },
        {
            id: 'SP007',
            name: 'Oppo Reno 11 F 5G',
            category: 'Oppo',
            price: 8990000,
            stock: 60,
            supplier: 'Oppo VN',
            status: 'active',
            sold: 92,
            revenue: 827080000
        },
        {
            id: 'SP008',
            name: 'Vivo V29e 5G',
            category: 'Vivo',
            price: 8990000,
            stock: 45,
            supplier: 'Digiworld',
            status: 'active',
            sold: 67,
            revenue: 602330000
        },
        {
            id: 'SP009',
            name: 'Realme 11 Pro+',
            category: 'Realme',
            price: 11990000,
            stock: 35,
            supplier: 'Digiworld',
            status: 'active',
            sold: 54,
            revenue: 647460000
        },
        {
            id: 'SP010',
            name: 'Nokia 105 4G Pro',
            category: 'Nokia',
            price: 650000,
            stock: 200,
            supplier: 'Nokia HMD',
            status: 'active',
            sold: 456,
            revenue: 296400000
        }
    ],

    // Dữ liệu đơn hàng
    orders: [
        {
            id: 'HD001',
            customer: 'Nguyen Van Khach',
            employee: 'Tran Thi Binh',
            date: '2024-04-01',
            total: 34990000,
            status: 'completed',
            items: [
                { product: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 34990000 }
            ]
        },
        {
            id: 'HD002',
            customer: 'Tran Thi Mua',
            employee: 'Tran Thi Binh',
            date: '2024-04-01',
            total: 21990000,
            status: 'completed',
            items: [
                { product: 'iPhone 14 Plus 128GB', quantity: 1, price: 21990000 }
            ]
        },
        {
            id: 'HD003',
            customer: 'Le Van Sam',
            employee: 'Pham Thi Dung',
            date: '2024-04-02',
            total: 31990000,
            status: 'completed',
            items: [
                { product: 'Samsung Galaxy S24 Ultra', quantity: 1, price: 31990000 }
            ]
        },
        {
            id: 'HD004',
            customer: 'Pham Thi Tieu',
            employee: 'Pham Thi Dung',
            date: '2024-04-02',
            total: 8490000,
            status: 'pending',
            items: [
                { product: 'Samsung Galaxy A54 5G', quantity: 1, price: 8490000 }
            ]
        },
        {
            id: 'HD005',
            customer: 'Hoang Van Dung',
            employee: 'Tran Thi Binh',
            date: '2024-04-03',
            total: 22990000,
            status: 'completed',
            items: [
                { product: 'Xiaomi 14 12GB/256GB', quantity: 1, price: 22990000 }
            ]
        },
        {
            id: 'HD006',
            customer: 'Do Thi Xai',
            employee: 'Vu Thi Hoa',
            date: '2024-04-03',
            total: 7290000,
            status: 'completed',
            items: [
                { product: 'Redmi Note 13 Pro', quantity: 1, price: 7290000 }
            ]
        },
        {
            id: 'HD007',
            customer: 'Ngo Van Tra',
            employee: 'Vu Thi Hoa',
            date: '2024-04-04',
            total: 8990000,
            status: 'cancelled',
            items: [
                { product: 'Oppo Reno 11 F 5G', quantity: 1, price: 8990000 }
            ]
        },
        {
            id: 'HD008',
            customer: 'Vu Thi Gop',
            employee: 'Bui Thi Kieu',
            date: '2024-04-04',
            total: 8990000,
            status: 'completed',
            items: [
                { product: 'Vivo V29e 5G', quantity: 1, price: 8990000 }
            ]
        },
        {
            id: 'HD009',
            customer: 'Dang Van Bill',
            employee: 'Bui Thi Kieu',
            date: '2024-04-05',
            total: 11990000,
            status: 'completed',
            items: [
                { product: 'Realme 11 Pro+', quantity: 1, price: 11990000 }
            ]
        },
        {
            id: 'HD010',
            customer: 'Bui Thi Don',
            employee: 'Bui Thi Kieu',
            date: '2024-04-05',
            total: 1300000,
            status: 'completed',
            items: [
                { product: 'Nokia 105 4G Pro', quantity: 2, price: 650000 }
            ]
        }
    ],

    // Dữ liệu khách hàng
    customers: [
        {
            id: 'KH001',
            name: 'Nguyen Van Khach',
            phone: '0990000001',
            email: 'khach1@gmail.com',
            address: 'Go Vap, HCM',
            orders: 15,
            totalSpent: 125000000,
            joinDate: '2023-01-15',
            status: 'active'
        },
        {
            id: 'KH002',
            name: 'Tran Thi Mua',
            phone: '0990000002',
            email: 'mua2@gmail.com',
            address: 'Tan Binh, HCM',
            orders: 8,
            totalSpent: 67500000,
            joinDate: '2023-03-20',
            status: 'active'
        },
        {
            id: 'KH003',
            name: 'Le Van Sam',
            phone: '0990000003',
            email: 'sam3@gmail.com',
            address: 'Quan 3, HCM',
            orders: 22,
            totalSpent: 215000000,
            joinDate: '2022-11-05',
            status: 'active'
        },
        {
            id: 'KH004',
            name: 'Pham Thi Tieu',
            phone: '0990000004',
            email: 'tieu4@gmail.com',
            address: 'Quan 1, HCM',
            orders: 3,
            totalSpent: 15000000,
            joinDate: '2024-02-10',
            status: 'active'
        },
        {
            id: 'KH005',
            name: 'Hoang Van Dung',
            phone: '0990000005',
            email: 'dung5@gmail.com',
            address: 'Binh Thanh, HCM',
            orders: 12,
            totalSpent: 98500000,
            joinDate: '2023-07-15',
            status: 'active'
        }
    ],

    // Dữ liệu nhân viên
    employees: [
        {
            id: 'NV001',
            name: 'Nguyen Van An',
            position: 'Quản lý',
            salary: 20000000,
            startDate: '2020-01-01',
            phone: '0901000001',
            email: 'an.nguyen@gmail.com',
            sales: 45,
            revenue: 1250000000,
            status: 'active'
        },
        {
            id: 'NV002',
            name: 'Tran Thi Binh',
            position: 'Bán hàng',
            salary: 8000000,
            startDate: '2021-02-15',
            phone: '0901000002',
            email: 'binh.tran@gmail.com',
            sales: 32,
            revenue: 856000000,
            status: 'active'
        },
        {
            id: 'NV003',
            name: 'Le Van Cuong',
            position: 'Kỹ thuật',
            salary: 10000000,
            startDate: '2021-03-10',
            phone: '0901000003',
            email: 'cuong.le@gmail.com',
            sales: 0,
            revenue: 0,
            status: 'active'
        },
        {
            id: 'NV004',
            name: 'Pham Thi Dung',
            position: 'Bán hàng',
            salary: 8000000,
            startDate: '2022-04-20',
            phone: '0901000004',
            email: 'dung.pham@gmail.com',
            sales: 28,
            revenue: 745000000,
            status: 'active'
        },
        {
            id: 'NV005',
            name: 'Hoang Van Em',
            position: 'Kho',
            salary: 9000000,
            startDate: '2022-05-05',
            phone: '0901000005',
            email: 'em.hoang@gmail.com',
            sales: 0,
            revenue: 0,
            status: 'active'
        }
    ],

    // Dữ liệu nhà cung cấp
    suppliers: [
        {
            id: 'NCC001',
            name: 'Apple Vietnam',
            contact: 'Tim Cook',
            phone: '02812345678',
            address: 'Quan 1, HCM',
            products: 15,
            totalOrders: 125,
            status: 'active'
        },
        {
            id: 'NCC002',
            name: 'Samsung Vina',
            contact: 'Lee Jae Yong',
            phone: '02887654321',
            address: 'Quan 1, HCM',
            products: 22,
            totalOrders: 189,
            status: 'active'
        },
        {
            id: 'NCC003',
            name: 'Xiaomi VN',
            contact: 'Lei Jun',
            phone: '02412345678',
            address: 'Cau Giay, HN',
            products: 18,
            totalOrders: 156,
            status: 'active'
        },
        {
            id: 'NCC004',
            name: 'Oppo VN',
            contact: 'Sky Li',
            phone: '02811122233',
            address: 'Quan 7, HCM',
            products: 12,
            totalOrders: 98,
            status: 'active'
        },
        {
            id: 'NCC005',
            name: 'FPT Trading',
            contact: 'Nguyen Van FPT',
            phone: '0909090909',
            address: 'Cau Giay, HN',
            products: 25,
            totalOrders: 210,
            status: 'active'
        }
    ],

    // Dữ liệu danh mục
    categories: [
        {
            id: 'DM001',
            name: 'iPhone',
            description: 'Điện thoại Apple iPhone',
            products: 8,
            revenue: 1250000000,
            status: 'active'
        },
        {
            id: 'DM002',
            name: 'Samsung',
            description: 'Điện thoại Samsung Galaxy',
            products: 12,
            revenue: 985000000,
            status: 'active'
        },
        {
            id: 'DM003',
            name: 'Xiaomi',
            description: 'Điện thoại Xiaomi, Redmi, Poco',
            products: 15,
            revenue: 756000000,
            status: 'active'
        },
        {
            id: 'DM004',
            name: 'Oppo',
            description: 'Điện thoại Oppo',
            products: 10,
            revenue: 456000000,
            status: 'active'
        },
        {
            id: 'DM005',
            name: 'Vivo',
            description: 'Điện thoại Vivo',
            products: 9,
            revenue: 389000000,
            status: 'active'
        }
    ],

    // Thông báo
    notifications: [
        {
            id: 1,
            title: 'Đơn hàng mới',
            message: 'Đơn hàng HD012 vừa được tạo',
            time: '5 phút trước',
            read: false,
            type: 'order'
        },
        {
            id: 2,
            title: 'Sản phẩm sắp hết hàng',
            message: 'iPhone 15 Pro Max còn 5 sản phẩm trong kho',
            time: '1 giờ trước',
            read: false,
            type: 'inventory'
        },
        {
            id: 3,
            title: 'Báo cáo tháng',
            message: 'Báo cáo doanh thu tháng 4 đã sẵn sàng',
            time: '3 giờ trước',
            read: true,
            type: 'report'
        },
        {
            id: 4,
            title: 'Khách hàng mới',
            message: 'Có 3 khách hàng mới đăng ký hôm nay',
            time: '5 giờ trước',
            read: true,
            type: 'customer'
        },
        {
            id: 5,
            title: 'Cập nhật hệ thống',
            message: 'Hệ thống sẽ bảo trì vào lúc 02:00 - 04:00',
            time: '1 ngày trước',
            read: true,
            type: 'system'
        }
    ]
};

// ========== BIẾN TOÀN CỤC ==========
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = { column: null, direction: 'asc' };

// ========== HÀM TIỆN ÍCH ==========

// Format số tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format ngày tháng
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Format số
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Hiệu ứng xuất hiện
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Tự động đóng sau 5 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Đóng khi click
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Thêm CSS cho notification
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        z-index: 9999;
        border-left: 4px solid #4cc9f0;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        border-left-color: #06d6a0;
    }
    
    .notification.error {
        border-left-color: #ef233c;
    }
    
    .notification.warning {
        border-left-color: #f72585;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    }
    
    .notification-content i {
        font-size: 20px;
    }
    
    .notification.success .notification-content i {
        color: #06d6a0;
    }
    
    .notification.error .notification-content i {
        color: #ef233c;
    }
    
    .notification.warning .notification-content i {
        color: #f72585;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6c757d;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: #e9ecef;
        color: #212529;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// ========== SIDEBAR TOGGLE ==========
function initSidebar() {
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            
            if (sidebar.classList.contains('collapsed')) {
                sidebar.style.width = 'var(--sidebar-collapsed)';
                mainContent.style.marginLeft = 'var(--sidebar-collapsed)';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            } else {
                sidebar.style.width = 'var(--sidebar-width)';
                mainContent.style.marginLeft = 'var(--sidebar-width)';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            }
        });
    }
}

// ========== NOTIFICATIONS ==========
function initNotifications() {
    const notificationIcon = document.querySelector('.notification-icon');
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationCount = document.querySelector('.notification-count');
    
    if (notificationIcon && notificationDropdown) {
        // Cập nhật số thông báo chưa đọc
        const unreadCount = sampleData.notifications.filter(n => !n.read).length;
        if (notificationCount) {
            notificationCount.textContent = unreadCount;
            if (unreadCount === 0) {
                notificationCount.style.display = 'none';
            }
        }
        
        // Hiển thị dropdown
        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.style.display = 
                notificationDropdown.style.display === 'block' ? 'none' : 'block';
            renderNotifications();
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            notificationDropdown.style.display = 'none';
        });
        
        // Ngăn dropdown đóng khi click bên trong
        notificationDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function renderNotifications() {
    const notificationList = document.querySelector('.notification-list');
    if (!notificationList) return;
    
    notificationList.innerHTML = sampleData.notifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${notification.time}</div>
        </div>
    `).join('');
    
    // Đánh dấu đã đọc khi click
    notificationList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            const notification = sampleData.notifications.find(n => n.id === id);
            if (notification && !notification.read) {
                notification.read = true;
                renderNotifications();
                
                // Cập nhật số thông báo
                const unreadCount = sampleData.notifications.filter(n => !n.read).length;
                const notificationCount = document.querySelector('.notification-count');
                if (notificationCount) {
                    notificationCount.textContent = unreadCount;
                    if (unreadCount === 0) {
                        notificationCount.style.display = 'none';
                    }
                }
                
                showNotification('Đã đánh dấu thông báo là đã đọc');
            }
        });
    });
}

// ========== USER MENU ==========
function initUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    const userDropdown = document.querySelector('.user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.style.display = 
                userDropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', () => {
            userDropdown.style.display = 'none';
        });
        
        // Ngăn dropdown đóng khi click bên trong
        userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Xử lý logout
        const logoutBtn = userDropdown.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    showNotification('Đã đăng xuất thành công');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1000);
                }
            });
        }
    }
}

// ========== MODAL HANDLING ==========
function initModals() {
    // Đóng modal khi click nút close
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Đóng modal khi click bên ngoài
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Mở modal
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    };
    
    // Đóng modal
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    };
}

// ========== TABLE SORTING ==========
function initTableSorting() {
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const table = this.closest('table');
            const columnIndex = Array.from(this.parentNode.children).indexOf(this);
            const isAsc = this.classList.contains('sort-asc');
            
            // Xóa class sort khỏi tất cả các header
            table.querySelectorAll('th.sortable').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Thêm class sort mới
            this.classList.toggle('sort-asc', !isAsc);
            this.classList.toggle('sort-desc', isAsc);
            
            // Sắp xếp dữ liệu
            sortTable(table, columnIndex, isAsc ? 'desc' : 'asc');
        });
    });
}

function sortTable(table, columnIndex, direction) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.children[columnIndex].textContent.trim();
        const bValue = b.children[columnIndex].textContent.trim();
        
        // Kiểm tra xem có phải là số không
        const aNum = parseFloat(aValue.replace(/[^0-9.-]+/g, ''));
        const bNum = parseFloat(bValue.replace(/[^0-9.-]+/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // So sánh chuỗi
        return direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });
    
    // Xóa các hàng cũ và thêm các hàng đã sắp xếp
    rows.forEach(row => tbody.appendChild(row));
}

// ========== PAGINATION ==========
function initPagination(totalItems, currentPage = 1) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    if (!pagination) return;
    
    let paginationHTML = `
        <button class="pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Hiển thị tối đa 5 trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
    
    // Xử lý sự kiện click
    pagination.querySelectorAll('.pagination-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.dataset.page;
            if (page) {
                // Gọi hàm xử lý phân trang
                if (window.handlePageChange) {
                    window.handlePageChange(parseInt(page));
                }
            } else if (this.classList.contains('prev')) {
                if (window.handlePageChange && currentPage > 1) {
                    window.handlePageChange(currentPage - 1);
                }
            } else if (this.classList.contains('next')) {
                if (window.handlePageChange && currentPage < totalPages) {
                    window.handlePageChange(currentPage + 1);
                }
            }
        });
    });
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            // Tìm kiếm trong bảng hiện tại
            const table = document.querySelector('table');
            if (!table) return;
            
            const rows = table.querySelectorAll('tbody tr');
            let visibleCount = 0;
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                    visibleCount++;
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Hiển thị thông báo nếu không tìm thấy
            const noResults = document.getElementById('no-results');
            if (visibleCount === 0 && searchTerm) {
                if (!noResults) {
                    const message = document.createElement('tr');
                    message.id = 'no-results';
                    message.innerHTML = `
                        <td colspan="100" style="text-align: center; padding: 40px;">
                            <i class="fas fa-search" style="font-size: 40px; color: #6c757d; margin-bottom: 10px;"></i>
                            <h3 style="color: #6c757d; margin-bottom: 10px;">Không tìm thấy kết quả</h3>
                            <p style="color: #adb5bd;">Không có kết quả nào phù hợp với "${searchTerm}"</p>
                        </td>
                    `;
                    table.querySelector('tbody').appendChild(message);
                }
            } else if (noResults) {
                noResults.remove();
            }
        });
    }
}

// ========== FORM VALIDATION ==========
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const inputs = this.querySelectorAll('.form-control[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                    
                    // Hiển thị thông báo lỗi
                    const error = input.nextElementSibling;
                    if (error && error.classList.contains('form-error')) {
                        error.textContent = 'Trường này là bắt buộc';
                        error.style.display = 'block';
                    }
                } else {
                    input.classList.remove('error');
                    
                    // Ẩn thông báo lỗi
                    const error = input.nextElementSibling;
                    if (error && error.classList.contains('form-error')) {
                        error.style.display = 'none';
                    }
                }
            });
            
            if (isValid) {
                // Xử lý submit form
                showNotification('Đã lưu thành công!', 'success');
                this.reset();
                
                // Đóng modal nếu có
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            } else {
                showNotification('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
            }
        });
        
        // Xóa lỗi khi người dùng bắt đầu nhập
        form.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const error = this.nextElementSibling;
                if (error && error.classList.contains('form-error')) {
                    error.style.display = 'none';
                }
            });
        });
    });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initNotifications();
    initUserMenu();
    initModals();
    initTableSorting();
    initSearch();
    initFormValidation();
    
    // Render notifications
    renderNotifications();
    
    // Cập nhật thời gian thực
    updateRealTime();
    setInterval(updateRealTime, 60000); // Cập nhật mỗi phút
    
    // Xử lý action buttons
    document.addEventListener('click', function(e) {
        // Xử lý nút xóa
        // if (e.target.closest('.delete-btn')) {
        //     const confirmDelete = confirm('Bạn có chắc chắn muốn xóa mục này không?');
        //     if (confirmDelete) {
        //         const row = e.target.closest('tr');
        //         if (row) {
        //             row.style.opacity = '0.5';
        //             setTimeout(() => {
        //                 row.style.display = 'none';
        //                 showNotification('Đã xóa thành công!', 'success');
        //             }, 300);
        //         }
        //     }
        // }
        
        // Xử lý nút xem chi tiết
        // if (e.target.closest('.view-btn')) {
        //     showNotification('Chức năng xem chi tiết đang được phát triển!', 'info');
        // }
        
        // // Xử lý nút sửa
        // if (e.target.closest('.edit-btn')) {
        //     showNotification('Chức năng chỉnh sửa đang được phát triển!', 'info');
        // }
    });
});

// ========== REAL-TIME UPDATES ==========
function updateRealTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('vi-VN');
    }
    
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ========== CHART FUNCTIONS ==========
window.renderChart = function(chartId, type, data, options) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 13
                },
                padding: 12,
                cornerRadius: 6
            }
        },
        scales: type === 'bar' ? {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            }
        } : {}
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Create chart
    return new Chart(ctx, {
        type: type,
        data: data,
        options: mergedOptions
    });
};

// ========== EXPORT FUNCTIONS ==========
window.exportToExcel = function(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            // Clean data
            let data = cols[j].textContent.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
            data = data.replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        
        csv.push(row.join(','));
    }
    
    // Download CSV file
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showNotification('Đã xuất dữ liệu thành công!', 'success');
};

window.exportToPDF = function(elementId, filename) {
    showNotification('Chức năng xuất PDF đang được phát triển!', 'info');
};

// ========== DATA FILTERING ==========
window.filterData = function(data, filters) {
    return data.filter(item => {
        for (const key in filters) {
            if (filters[key]) {
                if (typeof filters[key] === 'string') {
                    if (!String(item[key]).toLowerCase().includes(filters[key].toLowerCase())) {
                        return false;
                    }
                } else if (typeof filters[key] === 'function') {
                    if (!filters[key](item[key])) {
                        return false;
                    }
                }
            }
        }
        return true;
    });
};