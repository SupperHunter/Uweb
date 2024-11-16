const socketIo = require('socket.io');
class SocketConnect{
    static instance = null;
    constructor(server) {
        if (SocketConnect.instance) {
            return SocketConnect.instance;
        }

        this.io = socketIo(server);
        SocketConnect.instance = this;

        this.io.on('connection', (socket) => {
            console.log('A user connected');
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });
    }

    initialize() {
        console.log("Starting Socket.IO connection...");
        this.io.on('connection', (socket) => {
            try {
                console.log(`User connected: ${socket.id}`);

                socket.on('sendData', (data) => {
                    this.handleData(socket, data);
                });

                // Khi client ngắt kết nối
                socket.on('disconnect', () => {
                    console.log(`User disconnected: ${socket.id}`);
                });

            } catch (error) {
                console.error("Error during socket connection:", error);
            }
        });
    }

    handleData(socket, data) {
        try {
            console.log('Received data:', data);
            
            // Phát dữ liệu cho tất cả client
            this.io.emit('newData', data);
        } catch (error) {
            console.error("Error handling data:", error);
        }
    }
}

module.exports = SocketConnect;