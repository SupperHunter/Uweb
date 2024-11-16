const { json } = require("sequelize");
const Address = require("../../models/Address");
const PaymentInfor = require("../../models/PaymentInfor");
const Role = require("../../models/Role");
const User = require("../../models/User");
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
class UserManager {
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params, mặc định page = 1 và limit = 10

            const offset = (page - 1) * limit; // Tính toán offset dựa trên page và limit

            const { count, rows: users } = await User.findAndCountAll({
                include: ['role', 'addresses', 'payments'],
                where: { roleId: 2 },
                limit: parseInt(limit), // Số lượng người dùng trên mỗi trang
                offset: parseInt(offset), // Bỏ qua số lượng người dùng đã được hiển thị
            });

            const totalPages = Math.ceil(count / limit); // Tổng số trang

            console.log(count);

            res.status(200).json({
                users,
                totalUsers: count,
                totalPages,
                currentPage: parseInt(page),
            });
        } catch (error) {
            res.status(500).json({ error: 'Error fetching users' });
        }
    }

    async searchUsers(req, res) {
        try {
            const { page = 1, limit = 10, ketsearch } = req.query; // Get page and limit from query parameters

            const offset = (page - 1) * limit; // Calculate offset based on page and limit

            const { count, rows: users } = await User.findAndCountAll({
                where: {
                    [Op.or]: [
                        { username: { [Op.like]: `%${ketsearch}%` } },
                        { email: { [Op.like]: `%${ketsearch}%` } }
                    ]
                },
                limit: parseInt(limit), // Number of users per page
                offset: parseInt(offset), // Skip users based on offset
                include: ['role', 'addresses', 'payments']
            });

            const totalPages = Math.ceil(count / limit); // Calculate total pages

            res.status(200).json({
                users,
                totalUsers: count,
                totalPages,
                currentPage: parseInt(page),
            });
        } catch (error) {
            res.status(500).json({ error: 'Error searching users' });
        }
    }

    async ShowListUser(req, res) {
        return res.render('AdminViews/ManagerUser/listuser', { title: 'List User', layout: 'layouts/admin' })
    }


    async changePassword(req, res) {
        const { newPassword } = req.body;
        const userId = req.params.id;
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash password
            const result = await User.update({ password: hashedPassword }, { where: { id: userId } });
            if (result[0] === 1) {
                res.status(200).json({ message: 'Password updated successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error updating password' });
        }
    }
    async blockUser(req, res) {
        const userId = req.params.id;
        try {
            const result = await User.update({ blocked: false }, { where: { id: userId } });
            console.log(result);
            if (result[0] === 1) {
                res.status(200).json({ message: 'User blocked successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error blocking user' });
        }
    }

    async unblockUser(req, res) {
        const userId = req.params.id;
        try {
            const result = await User.update({ blocked: true }, { where: { id: userId } });
            if (result[0] === 1) {
                res.status(200).json({ message: 'User unblocked successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error unblocking user' });
        }
    }

    async GetUserInfor(req, res) {
        const userid = req.params.id;
        console.log(userid);
        try {
            const user = await User.findOne({  // Add await here
                where: { id: userid },
                include: [
                    { model: Role, as: 'role' },
                    { model: Address, as: 'addresses' },
                    { model: PaymentInfor, as: 'payments' }
                ]
            });
            if (user) {
                return res.status(200).json({ user })
            } else {
                res.status(404).json({ error: 'User not found' });
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Error unblocking user' });
        }
    }
    async RenderUserInfor(req, res) {
        const userId = req.params.userId;
        const user = await User.findOne({  // Add await here
            where: { id: userId },
            include: [
                { model: Role, as: 'role' },
                { model: Address, as: 'addresses' },
                { model: PaymentInfor, as: 'payments' }
            ]
        });
        if (user) {
            return res.render('AdminViews/ManagerUser/UserInfor', { title: 'UserInfor', user, layout: 'layouts/admin' })
        } else {
            return res.redirect('/admin/ListUser')
        }
    }
}

module.exports = UserManager