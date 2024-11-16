const { exec } = require('child_process');

class ConnectToMobile {
    static instance = null;
    static ListDevices = []; // Khởi tạo mảng lưu danh sách thiết bị

    constructor() {
        if (ConnectToMobile.instance) return ConnectToMobile.instance;
        ConnectToMobile.instance = this;
    }

    // Phương thức lấy danh sách thiết bị và cập nhật ListDevices
    getDevices() {
        return new Promise((resolve, reject) => {
            exec('adb devices', (error, stdout, stderr) => {
                if (error) {
                    reject(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    reject(`Stderr: ${stderr}`);
                    return;
                }

                // Tách các dòng đầu ra từ lệnh adb devices
                const lines = stdout.split('\n').slice(1); // Bỏ dòng tiêu đề đầu tiên
                const devices = [];

                lines.forEach(line => {
                    const parts = line.split('\t');
                    if (parts.length > 1) {
                        const serial = parts[0];  // Serial number của thiết bị
                        const status = true;  // Trạng thái thiết bị
                        devices.push({ serial, status });  // Thêm vào mảng tạm thời
                    }
                });

                // Cập nhật ListDevices với danh sách thiết bị mới
                ConnectToMobile.ListDevices = devices;
                console.log(ConnectToMobile.ListDevices);
                resolve(ConnectToMobile.ListDevices);
            });
        });
    }

    // Hàm kiểm tra thiết bị có hoạt động hay không
    checkDeviceStatus(serial) {
        return this.getDevices()
            .then(devices => {
                const device = devices.find(d => d.serial === serial);
                if (device) {
                    return `Device ${serial} is ${device.status}.`;
                } else {
                    return `Device ${serial} is not connected.`;
                }
            })
            .catch(error => {
                return `Error checking device status: ${error}`;
            });
    }

    // Hàm lấy danh sách từ ListDevices
    getListDevices() {
        return ConnectToMobile.ListDevices;
    }
}

module.exports = ConnectToMobile;
