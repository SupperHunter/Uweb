const fs = require('fs').promises;
/**
     * Chuyển đổi file ảnh thành chuỗi Base64
     * @param {File} file - Đối tượng file nhận từ request (ví dụ: Multer)
     * @returns {Promise<string>} - Chuỗi Base64 của ảnh
     */
const imageToBase64 = async (imagefile)=>{
    try {
        if (!imagefile || !imagefile.path) {
            throw new Error('File không hợp lệ');
        }
        const imagebuffer = await fs.readFile(file.path);
        const Base64String = imagebuffer.toString();
        return Base64String;
    } catch (error) {
        console.error('Lỗi khi chuyển ảnh sang Base64:', error);
        throw error;
    }
}

module.exports = imageToBase64;