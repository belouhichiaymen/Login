const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// مصفوفة لتخزين المستخدمين (بدون قاعدة بيانات)
let users = [];

// تهيئة المستخدمين المبدئيين
const initializeUsers = async () => {
    const initialUsers = [
        { name: 'إيمن لوحيشي', password: 'password123' },
        { name: 'ياسين غزواني', password: 'pass1234' },
        { name: 'لؤي السلائمي', password: 'secret123' }
    ];

    for (const user of initialUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        users.push({
            id: users.length + 1,
            name: user.name,
            password: hashedPassword,
            createdAt: new Date()
        });
    }
    
    console.log('تم تهيئة المستخدمين:', users.map(u => u.name));
};

// استدعاء التهيئة عند تشغيل الخادم
initializeUsers();

// API للتحقق من المستخدم
app.post('/check-user', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.json({ 
            success: false, 
            message: 'الرجاء إدخال الاسم وكلمة المرور' 
        });
    }

    try {
        // البحث عن المستخدم في المصفوفة
        const user = users.find(u => u.name === name);
        
        if (user) {
            // المستخدم موجود - التحقق من كلمة المرور
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (passwordMatch) {
                // كلمة المرور صحيحة
                res.json({ 
                    success: true, 
                    exists: true,
                    validPassword: true,
                    message: `مرحباً ${name}!`,
                    user: { id: user.id, name: user.name }
                });
            } else {
                // كلمة المرور خاطئة
                res.json({ 
                    success: true, 
                    exists: true,
                    validPassword: false,
                    message: 'كلمة المرور غير صحيحة!'
                });
            }
        } else {
            // المستخدم غير موجود
            res.json({ 
                success: true, 
                exists: false,
                validPassword: false,
                message: `المستخدم ${name} غير مسجل في النظام!`
            });
        }
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'خطأ في النظام' 
        });
    }
});

// API لإضافة مستخدم جديد
app.post('/add-user', async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.json({ 
            success: false, 
            message: 'الرجاء إدخال الاسم وكلمة المرور' 
        });
    }

    try {
        // التحقق إذا كان المستخدم موجود مسبقاً
        const existingUser = users.find(u => u.name === name);
        
        if (existingUser) {
            return res.json({ 
                success: false, 
                message: 'المستخدم موجود مسبقاً!' 
            });
        }

        // تشفير كلمة المرور وإضافة المستخدم
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            name: name,
            password: hashedPassword,
            createdAt: new Date()
        };
        
        users.push(newUser);
        
        res.json({ 
            success: true, 
            message: `تم إضافة المستخدم ${name} بنجاح`,
            userId: newUser.id
        });
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'خطأ في إضافة المستخدم' 
        });
    }
});

// API لعرض جميع المستخدمين (للتجربة)
app.get('/users', (req, res) => {
    res.json({ 
        success: true, 
        users: users.map(u => ({ id: u.id, name: u.name, createdAt: u.createdAt })),
        count: users.length
    });
});

// API لحذف مستخدم (للتجربة)
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const initialLength = users.length;
    
    users = users.filter(u => u.id !== userId);
    
    if (users.length < initialLength) {
        res.json({ 
            success: true, 
            message: `تم حذف المستخدم رقم ${userId}`
        });
    } else {
        res.json({ 
            success: false, 
            message: 'المستخدم غير موجود'
        });
    }
});

app.listen(port, () => {
    console.log(`الخادم يعمل على http://localhost:${port}`);
    console.log('تم تشغيل النظام بدون قاعدة بيانات - البيانات مخزنة في 
