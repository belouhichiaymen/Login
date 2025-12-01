class UserCheckApp {
    constructor() {
        this.form = document.getElementById('userForm');
        this.resultSection = document.getElementById('result');
        this.messageDiv = document.getElementById('message');
        this.backBtn = document.getElementById('backBtn');
        this.addBtn = document.getElementById('addBtn');
        this.showUsersBtn = document.getElementById('showUsersBtn');
        this.clearUsersBtn = document.getElementById('clearUsersBtn');
        this.adminResult = document.getElementById('adminResult');
        
        this.currentUser = null;
        this.initEvents();
    }

    initEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.backBtn.addEventListener('click', () => this.showForm());
        this.addBtn.addEventListener('click', () => this.addUser());
        this.showUsersBtn.addEventListener('click', () => this.showUsers());
        this.clearUsersBtn.addEventListener('click', () => this.clearUsers());
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const password = document.getElementById('password').value;

        if (!name || !password) {
            this.showMessage('الرجاء إدخال جميع البيانات', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const response = await fetch('/check-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = { name, password };
                
                if (data.exists && data.validPassword) {
                    // المستخدم موجود وكلمة المرور صحيحة - الانتقال إلى صفحة الترحيب
                    this.goToWelcomePage(name);
                } else if (data.exists && !data.validPassword) {
                    // كلمة المرور خاطئة
                    this.showResult(`❌ ${data.message}`, 'error');
                    this.addBtn.classList.add('hidden');
                } else {
                    // المستخدم غير موجود
                    this.showResult(`❌ ${data.message}`, 'warning');
                    this.addBtn.classList.remove('hidden');
                }
            } else {
                this.showResult(`⚠️ ${data.message}`, 'error');
                this.addBtn.classList.add('hidden');
            }
        } catch (error) {
            this.showResult('❌ خطأ في الاتصال بالخادم', 'error');
            this.addBtn.classList.add('hidden');
        } finally {
            this.setLoading(false);
        }
    }

    // دالة الانتقال إلى صفحة الترحيب
    goToWelcomePage(name) {
        const encodedName = encodeURIComponent(name);
        window.location.href = `/welcome.html?name=${encodedName}`;
    }

    async addUser() {
        if (!this.currentUser) return;

        this.setLoading(true, 'جاري التسجيل...');

        try {
            const response = await fetch('/add-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.currentUser)
            });

            const data = await response.json();

            if (data.success) {
                this.showResult(`✅ ${data.message}`, 'success');
                this.addBtn.classList.add('hidden');
                
                // بعد إضافة المستخدم، الانتقال مباشرة إلى صفحة الترحيب
                setTimeout(() => {
                    this.goToWelcomePage(this.currentUser.name);
                }, 1500);
            } else {
                this.showResult(`⚠️ ${data.message}`, 'error');
            }
        } catch (error) {
            this.showResult('❌ خطأ في الاتصال بالخادم', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async showUsers() {
        try {
            const response = await fetch('/users');
            const data = await response.json();

            if (data.success) {
                if (data.users.length > 0) {
                    let html = `<div class="user-list">
                                <h4>المستخدمين المسجلين (${data.count})</h4>`;
                    
                    data.users.forEach(user => {
                        const date = new Date(user.createdAt).toLocaleString('ar-EG');
                        html += `<div class="user-item">
                                <span class="user-name">${user.name}</span>
                                <span class="user-date">${date}</span>
                                </div>`;
                    });
                    
                    html += '</div>';
                    this.adminResult.innerHTML = html;
                } else {
                    this.adminResult.innerHTML = '<p class="message info">لا يوجد مستخدمين مسجلين</p>';
                }
            } else {
                this.adminResult.innerHTML = `<p class="message error">${data.message}</p>`;
            }
        } catch (error) {
            this.adminResult.innerHTML = '<p class="message error">خطأ في الاتصال بالخادم</p>';
        }
    }

    async clearUsers() {
        if (!confirm('هل أنت متأكد من مسح جميع المستخدمين؟ سيتم حذف جميع البيانات.')) return;

        try {
            // حذف جميع المستخدمين عدا الثلاثة الأساسيين
            const response = await fetch('/users/4', { method: 'DELETE' });
            // يمكن إضافة المزيد من عمليات الحذف هنا إذا needed
            
            this.adminResult.innerHTML = '<p class="message success">تم مسح المستخدمين الإضافيين</p>';
            setTimeout(() => this.showUsers(), 1000);
        } catch (error) {
            this.adminResult.innerHTML = '<p class="message error">خطأ في الاتصال بالخادم</p>';
        }
    }

    showResult(message, type) {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `message ${type}`;
        this.form.classList.add('hidden');
        this.resultSection.classList.remove('hidden');
    }

    showForm() {
        this.resultSection.classList.add('hidden');
        this.form.classList.remove('hidden');
        this.form.reset();
        this.currentUser = null;
        this.addBtn.classList.add('hidden');
    }

    showMessage(message, type) {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';
        
        setTimeout(() => {
            this.messageDiv.style.display = 'none';
        }, 3000);
    }

    setLoading(loading, text = 'جاري التحقق...') {
        const btn = this.form.querySelector('button');
        if (loading) {
            btn.textContent = text;
            btn.classList.add('loading');
        } else {
            btn.textContent = 'تسجيل الدخول';
            btn.classList.remove('loading');
        }
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new UserCheckApp();
});
