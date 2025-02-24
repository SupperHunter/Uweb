const Storage = require("../../models/Storage");


class StorageController {
    async ShowList(req, res) {
        try {
            const storages = await Storage.findAll({
                where: { isActive: true }
            });
            res.render('AdminViews/storage/ManagerStorages', { storages, title: 'Storage List', layout: 'layouts/admin' });
        } catch (err) {
            res.status(500).send(err.message);
        }

    }

    async create(req, res) {
        try {
            const { size } = req.body;

            console.log(req.body);
            await Storage.create({ size, IsActive: true });
            res.redirect('/admin/storages');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async showEditForm(req, res) {
        try {
            const storage = await Storage.findByPk(req.params.id);
            if (!storage) return res.status(404).send('Storage not found');
            res.render('AdminViews/storage/ManagerStorages', { storage, title: 'Edit Storage', layout: 'layouts/admin' });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    async update(req, res) {
        try {
            const { size } = req.body;
            console.log(req.body);
            const storage = await Storage.findByPk(req.params.id);
            if (!storage) return res.status(404).send('Storage not found');
            await storage.update({ size });
            res.redirect('/admin/storages');
        } catch (err) {
            res.status(500).send(err.message);
        }
    }


    async deleteStorage(req, res) {
        try {
            const { id } = req.params;
            await Storage.update({ IsActive: false }, { where: { id } }); // Cập nhật IsActive thành false
            res.redirect('/admin/storages'); // Chuyển hướng về trang tạo
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

}

module.exports = StorageController;