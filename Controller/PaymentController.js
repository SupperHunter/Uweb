const { google } = require('googleapis');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { stdout } = require('process');
const SocketConnect = require('../Connect/SocketConnect');
const ConnectToMobile = require('../Connect/ConnectToMoblile');
// Đọc thông tin xác thực từ tệp JSON
const KEY_PATH = path.join(__dirname, '..', 'path-to-your-service-account-key.json');
const credentials = JSON.parse(fs.readFileSync(KEY_PATH));

const { client_id, client_secret, redirect_uris } = credentials.web;

const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);
let Process = 0;
const emulatorCommand = 'adb shell am start -n com.google.android.apps.walletnfcrel/com.google.android.apps.wallet.main.swanlake.SwanLakeActivity';
const realDeviceCommand = 'adb shell input tap 884 2000';
const Step2 = "adb shell input tap 309 549";
const Step3 = "adb shell input tap 252 1000";
const Step4 = "adb shell input tap 252 1000";
const exitapp = "adb shell am force-stop com.google.android.apps.walletnfcrel";
const OpenWallet = (FormData, socket, serial, indextof) => {

    // run real comman 
    exec(`adb -s "${serial}" shell input tap 884 2000`, (error1, stdou1t, stderr1) => {
        if (error1) {
            console.error(`Error executing ADB command on emulator: ${error1}`);
            return;
        }
        setTimeout(() => {
            exec(`adb -s "${serial}" shell input tap 309 549`, (error2, stdout2, stderr2) => {
                if (error2) {
                    console.error(`Error executing tap command: ${error2}`);
                    return;
                }
                setTimeout(() => {

                    exec(Step3, (error3, stdout3, stderr3) => {
                        if (error3) return;
                    });

                    setTimeout(() => {
                        fillCreditCardForm(FormData, socket, serial, indextof);
                    }, 3000);
                }, 3000);

            });
        }, 3000); // Adjust timeout as needed to ensure Wallet is fully openedx

        console.log('Google Wallet opened on emulator successfully!');
    });
}

function runAdbCommand(command, stepnumber, Socket, serial, callback = null) {

    const commanSubmit = command.replace('adb', `adb -s ${serial}`);

    exec(commanSubmit, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing adb command: ${error.message}`);
            return;
        }
        Process = stepnumber * 25;
        console.log(Process);
        Socket.io.emit('progress', { Process });
        if (callback) {
            callback(stdout);
        }
    });
}
const ResovleKeySpace = (Key, callback = null) => {
    const StringKey = key.trim().split(/\s+/);
    for (let x in StringKey) {
        let query = "adb shell input text " + x;
        exec(query, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing adb command: ${error.message}`);
                return;
            }
        });
    }
    if (callback) callback();
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi khi thực thi lệnh: ${command}, Lỗi: ${error}`);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}


async function clearTextMultiple() {
    try {
        await runCommand('adb shell input keyevent KEYCODE_MOVE_END');
        for (let i = 0; i < 30; i++) {
            await runCommand('adb shell input keyevent KEYCODE_DEL');
        }
    } catch (error) {
        console.error(error);
    }
}

async function SubmitForm(socket, serial, indextof) {
    await setTimeout(() => {
        runAdbCommand(Step3, 2, socket, serial, () => {
            setTimeout(() => {
                runAdbCommand(`adb shell input tap 900 1200`, 2.5, socket, serial, () => {
                    runAdbCommand(`adb shell input tap 900 1200`, 3, socket, serial, () => {
                        setTimeout(() => {
                            runAdbCommand(realDeviceCommand, 3.5, socket, serial, () => {
                                runAdbCommand(realDeviceCommand, 3.6, socket, serial, () => {
                                    setTimeout(() => {
                                        runAdbCommand(realDeviceCommand, 3.7, socket, serial, () => [
                                            runAdbCommand(realDeviceCommand, 3.8, socket, serial, () => {
                                                setTimeout(() => {
                                                    runAdbCommand(realDeviceCommand, 4, socket, serial, () => {
                                                        ConnectToMobile.ListDevices[indextof].status = true;
                                                        console.log('successfull');
                                                    })
                                                }, 10000);
                                            })
                                        ])
                                    }, 1000);
                                })
                            })
                        }, 15000);
                    })
                })
            }, 2000);
        })
    }, 4000);
}


const fillCreditCardForm = async (cardData, socket, serial, indextof) => {
    // Điền số thẻ tín dụng
    console.log(cardData.cardNumber);
    runAdbCommand(`adb shell input text "${cardData.cardNumber}"`, 0.5, socket, serial, () => {
        runAdbCommand(`adb shell input text "${cardData.expiryDate}"`, 1, socket, serial, () => {
            runAdbCommand(`adb shell input text "${cardData.cvv}"`, 1.5, socket, serial, () => {
                SubmitForm(socket, serial, indextof);
            })
        });
    });
}



const addCard = async (req, res) => {
    const socketConnect = SocketConnect.instance;
    let deviceSerial = '';
    let indextof = -1;
    for (let Value of ConnectToMobile.ListDevices) {
        indextof++;
        if (Value.status) {
            deviceSerial = Value.serial;
            break;
        }
    }
    ConnectToMobile.ListDevices[indextof].status = false;
    if (deviceSerial == '') return;

    const { firstName, address, cardNumber, expiry, cvv, City, zipCode, Option } = req.body;
    // Cấu hình thông tin thẻ
    const cardData = {
        cardNumber: cardNumber.replace(/\s+/g, ''), // Số thẻ tín dụng
        expiryDate: expiry, // Ngày hết hạn
        cvv: cvv, // CVV
        cardHolder: firstName, // Tên chủ thẻ
        address: address, // Địa chỉ
        city: City, // Thành phố
        option: Option,
        state: 'CA', // Mã tỉnh
        postalCode: zipCode // Mã bưu chính
    };

    try {
        OpenWallet(cardData, socketConnect, deviceSerial, indextof);
        res.redirect(`/payment/process?cardnumber=${cardNumber}`);
        ;
    } catch (error) {
        // Phản hồi lỗi
        console.error('Error adding card:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
module.exports = {
    addCard
};
