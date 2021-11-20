/*！
 * @file pxt-ObloqIIC/ObloqIIC.ts
 * @brief DFRobot's obloq makecode library.
 * @n [Get the module here](http://www.dfrobot.com.cn/goods-1577.html)
 * @n Obloq is a serial port of WIFI connection module, Obloq can connect 
 *    to Microsoft Azure IoT and other standard MQTT protocol IoT.
 *
 * @copyright	[DFRobot](http://www.dfrobot.com), 2016
 * @copyright	GNU Lesser General Public License
 *
 * @author [email](xiao.wu@dfrobot.com)
 * @version  V0.1
 * @date  2019-05-31
 */


//debug
const OBLOQ_DEBUG = false
const OBLOQ_MQTT_DEFAULT_SERVER = true
//DFRobot easy iot
const OBLOQ_MQTT_EASY_IOT_SERVER_CHINA = "192.168.1.8"
const OBLOQ_MQTT_EASY_IOT_SERVER_GLOBAL = "192.168.1.8"
const OBLOQ_MQTT_EASY_IOT_PORT = 1883
//other iot
const OBLOQ_MQTT_USER_IOT_SERVER = "---.-----.---"
const OBLOQ_MQTT_USER_IOT_PORT = 0
//topic max number
const OBLOQ_MQTT_TOPIC_NUM_MAX = 5
//wrong type
const OBLOQ_ERROR_TYPE_IS_SUCCE = 0
const OBLOQ_ERROR_TYPE_IS_ERR = 1
const OBLOQ_ERROR_TYPE_IS_WIFI_CONNECT_TIMEOUT = -1
const OBLOQ_ERROR_TYPE_IS_WIFI_CONNECT_FAILURE = -2
const OBLOQ_ERROR_TYPE_IS_MQTT_SUBTOPIC_TIMEOUT = -3
const OBLOQ_ERROR_TYPE_IS_MQTT_CONNECT_TIMEOUT = -4
const OBLOQ_ERROR_TYPE_IS_MQTT_CONNECT_FAILURE = -5
const OBLOQ_ERROR_TYPE_IS_MQTT_SUBTOPIC_FAILURE = -6
//data type
const OBLOQ_STR_TYPE_IS_NONE = ""
const OBLOQ_BOOL_TYPE_IS_TRUE = true
const OBLOQ_BOOL_TYPE_IS_FALSE = false

/**
 *Obloq implementation method.
 */
//% weight=10 color=#008B00 icon="\uf1eb" block="ObloqIIC"
namespace ObloqIIC {
    let IIC_ADDRESS = 0x16
    let Topic0CallBack: Action = null;
    let Topic1CallBack: Action = null;
    let Topic2CallBack: Action = null;
    let Topic3CallBack: Action = null;
    let Topic4CallBack: Action = null;
    let Wifi_Status = 0x00
    let ObloqIIC_Mode = 0x00
    let MQTT = 0x00
    let HTTP = 0x01

    let READ_STATUS = 0x00
    let SET_PARA = 0x01
    let RUN_COMMAND = 0x02

    /*set para*/
    let SETWIFI_NAME = 0x01
    let SETWIFI_PASSWORLD = 0x02
    let SETMQTT_SERVER = 0x03
    let SETMQTT_PORT = 0x04
    let SETMQTT_ID = 0x05
    let SETMQTT_PASSWORLD = 0x06
    let SETHTTP_IP = 0x07
    let SETHTTP_PORT = 0x08

    /*run command*/
    let SEND_PING = 0x01
    let CONNECT_WIFI = 0x02
    let RECONNECT_WIFI = 0x03
    let DISCONECT_WIFI = 0x04
    let CONNECT_MQTT = 0x05
    let SUB_TOPIC0 = 0x06
    let SUB_TOPIC1 = 0x07
    let SUB_TOPIC2 = 0x08
    let SUB_TOPIC3 = 0x09
    let SUB_TOPIC4 = 0x0A
    let PUB_TOPIC0 = 0x0B
    let PUB_TOPIC1 = 0x0C
    let PUB_TOPIC2 = 0x0D
    let PUB_TOPIC3 = 0x0E
    let PUB_TOPIC4 = 0x0F
    let GET_URL = 0x10
    let POST_URL = 0x11
    let PUT_URL = 0x12
    let GET_VERSION = 0x13


    /*read para value*/
    let READ_PING = 0x01
    let READ_WIFISTATUS = 0x02
    let READ_IP = 0x03
    let READ_MQTTSTATUS = 0x04
    let READ_SUBSTATUS = 0x05
    let READ_TOPICDATA = 0x06
    let HTTP_REQUEST = 0x10
    let READ_VERSION = 0x12

    /*para status */
    let PING_ERR = 0x00
    let PING_OK = 0x01
    let WIFI_DISCONNECT = 0x00
    let WIFI_CONNECTING = 0x02
    let WIFI_CONNECTED = 0x03
    let MQTT_CONNECTED = 0x01
    let MQTT_CONNECTERR = 0x02
    let SUB_TOPIC_OK = 0x01
    let SUB_TOPIC_Ceiling = 0x02
    let SUB_TOPIC_ERR = 0x03

    let ObloqIICStatus = ""
    let ObloqIICData = ""
    let WIFI_NAME = ""
    let WIFI_PASSWORLD = ""
    let MQTT_SERVER = ""
    let MQTT_PORT = ""
    let MQTT_ID = ""
    let MQTT_PASSWORLD = ""
    let Topic_0 = ""
    let Topic_1 = ""
    let Topic_2 = ""
    let Topic_3 = ""
    let Topic_4 = ""
    let RECDATA = ""
    let HTTP_IP = ""
    let HTTP_PORT = ""
    let ObloqIIC_IP = "0.0.0.0"

    export enum SERVERS {
        //% blockId=SERVERS_China block="China"
        China,
        //% blockId=SERVERS_Global block="Global"
        Global
    }

    export enum TOPIC {
        topic_0 = 0,
        topic_1 = 1,
        topic_2 = 2,
        topic_3 = 3,
        topic_4 = 4
    }

    export class PacketMqtt {
        public message: string;
    }

    function ObloqIIC_setPara(cmd: number, para: string): void {
        let buf = pins.createBuffer(para.length + 4);
        buf[0] = 0x1E
        buf[1] = SET_PARA
        buf[2] = cmd
        buf[3] = para.length
        for (let i = 0; i < para.length; i++)
            buf[i + 4] = para[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function ObloqIIC_runCommand(cmd: number): void {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }

    function ObloqIIC_readStatus(para: number): number {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        return recbuf[1]
    }

    function ObloqIIC_readValue(para: number): string {
        let buf = pins.createBuffer(3);
        let paraValue = 0x00
        let tempLen = 0x00
        let dataValue = ""
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = para
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        ObloqIIC_CheckStatus("READ_IP");
        return RECDATA
    }

    function ObloqIIC_ParaRunCommand(cmd: number, data: string): void {
        let buf = pins.createBuffer(data.length + 4)
        buf[0] = 0x1E
        buf[1] = RUN_COMMAND
        buf[2] = cmd
        buf[3] = data.length
        for (let i = 0; i < data.length; i++)
            buf[i + 4] = data[i].charCodeAt(0)
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
    }
    function ObloqIIC_CheckStatus(cmd: string): void {
        while (true) {
            if (ObloqIICStatus == cmd) {
                serial.writeString("OKOK\r\n");
                return;
            }
            basic.pause(50);
        }
    }
    /**
     * Two parallel stepper motors are executed simultaneously(DegreeDual).
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param IOT_ID to IOT_ID ,eg: "yourIotId"
     * @param IOT_PWD to IOT_PWD ,eg: "yourIotPwd"
     * @param IOT_TOPIC to IOT_TOPIC ,eg: "yourIotTopic"
    */
    //% weight=100
    //% blockExternalInputs=1
    //% blockId=ObloqIIC_MQTT block="Micro:IoT setup mqtt|Wi-Fi: |name: %SSID| password：%PASSWORD| IOT_ID: %IOT_ID| IOT_PWD :%IOT_PWD| IoT service:|(default topic_0) Topic: %IOT_TOPIC| start connection:| server: %SERVERS"
    export function ObloqIIC_MQTT(SSID: string, PASSWORD: string,
        IOT_ID: string, IOT_PWD: string,
        IOT_TOPIC: string, servers: SERVERS):
        void {
        ObloqIIC_Mode = MQTT
        ObloqIIC_setPara(SETWIFI_NAME, SSID)
        ObloqIIC_setPara(SETWIFI_PASSWORLD, PASSWORD)
        if (servers == SERVERS.China) {
            ObloqIIC_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_CHINA)
        } else {
            ObloqIIC_setPara(SETMQTT_SERVER, OBLOQ_MQTT_EASY_IOT_SERVER_GLOBAL)
        }
        ObloqIIC_setPara(SETMQTT_PORT, "1883")
        ObloqIIC_setPara(SETMQTT_ID, IOT_ID)
        ObloqIIC_setPara(SETMQTT_PASSWORLD, IOT_PWD)
        ObloqIIC_runCommand(CONNECT_WIFI)
        ObloqIIC_CheckStatus("WiFiConnected");
        /*
        while (ObloqIIC_readStatus(READ_WIFISTATUS) != WIFI_CONNECTED) {
            basic.pause(200)
        }*/
        serial.writeString("wifi conneced ok\r\n");
        Wifi_Status = WIFI_CONNECTED
        ObloqIIC_runCommand(CONNECT_MQTT);
        ObloqIIC_CheckStatus("MQTTConnected");
        serial.writeString("mqtt connected\r\n");
        /*
        while (ObloqIIC_readStatus(READ_MQTTSTATUS) != MQTT_CONNECTED) {
            basic.pause(200)
        }*/
        Topic_0 = IOT_TOPIC
        ObloqIIC_ParaRunCommand(SUB_TOPIC0, IOT_TOPIC);
        ObloqIIC_CheckStatus("SubTopicOK");
        serial.writeString("sub topic ok\r\n");
        /*    
        while (ObloqIIC_readStatus(READ_SUBSTATUS) != SUB_TOPIC_OK) {
            basic.pause(200)
        }*/

    }

    //% weight=200
    //% blockId=ObloqIIC_add_topic
    //% block="subscribe additional %top |: %IOT_TOPIC"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    //% advanced=true
    export function ObloqIIC_add_topic(top: TOPIC, IOT_TOPIC: string): void {
        ObloqIIC_ParaRunCommand((top+0x06), IOT_TOPIC);
        /*
        while (ObloqIIC_readStatus(READ_SUBSTATUS) != SUB_TOPIC_OK) {
            basic.pause(200)
        }*/
        ObloqIIC_CheckStatus("SubTopicOK");
        
    }
    /**
     * @param Mess to Mess ,eg: "mess"
     */
    //% weight=99
    //% blockId=ObloqIIC_SendMessage block="Send Message %string| to |%TOPIC"
    export function ObloqIIC_SendMessage(Mess: string, Topic: TOPIC): void {
        let topic = 0
        switch (Topic) {
            case TOPIC.topic_0:
                topic = PUB_TOPIC0
                break;
            case TOPIC.topic_1:
                topic = PUB_TOPIC1
                break;
            case TOPIC.topic_2:
                topic = PUB_TOPIC2
                break;
            case TOPIC.topic_3:
                topic = PUB_TOPIC3
                break;
            case TOPIC.topic_4:
                topic = PUB_TOPIC4
                break;
            default:
                break;

        }
        ObloqIIC_ParaRunCommand(topic, Mess)

    }

    function ObloqIIC_callback(top: TOPIC, a: Action): void {
        switch (top) {
            case TOPIC.topic_0:
                Topic0CallBack = a;
                break;
            case TOPIC.topic_1:
                Topic1CallBack = a;
                break;
            case TOPIC.topic_2:
                Topic2CallBack = a;
                break;
            case TOPIC.topic_3:
                Topic3CallBack = a;
                break;
            case TOPIC.topic_4:
                Topic4CallBack = a;
                break;
            default:
                break;
        }
    }

    //% weight=98
    //% blockGap=60
    //% blockId=obloq_mqtt_callback_user_more block="on %top |received"
    //% top.fieldEditor="gridpicker" top.fieldOptions.columns=2
    export function ObloqIIC_MQTT_Event(top: TOPIC, cb: (message: string) => void) {
        ObloqIIC_callback(top, () => {
            const packet = new PacketMqtt()
            packet.message = RECDATA
            cb(packet.message)
        });
    }


    /**
     * Two parallel stepper motors are executed simultaneously(DegreeDual).
     * @param SSID to SSID ,eg: "yourSSID"
     * @param PASSWORD to PASSWORD ,eg: "yourPASSWORD"
     * @param IP to IP ,eg: "0.0.0.0"
     * @param PORT to PORT ,eg: 80
    */
    //% weight=80
    //% blockId=ObloqIIC_http_setup
    //% block="Micro:IoT setup http | Wi-Fi: | name: %SSID| password: %PASSWORD| http config: | ip: %IP| port: %PORT| start connection"
    export function ObloqIIC_http_setup(SSID: string, PASSWORD: string,
        IP: string, PORT: number):
        void {
        ObloqIIC_Mode = HTTP
        ObloqIIC_setPara(SETWIFI_NAME, SSID)
        ObloqIIC_setPara(SETWIFI_PASSWORLD, PASSWORD)
        ObloqIIC_setPara(SETHTTP_IP, IP)
        ObloqIIC_setPara(SETHTTP_PORT, PORT.toString())
        ObloqIIC_runCommand(CONNECT_WIFI)
        ObloqIIC_CheckStatus("WiFiConnected");
        Wifi_Status = WIFI_CONNECTED
    }

    function ObloqIIC_http_wait_request(time: number) :string{
        if(time < 100){
            time = 100
        }
        let timwout = time / 100
        let _timeout = 0
        while(true){
            basic.pause(100)
            if (ObloqIICStatus == "HTTP_REQUEST"){
                return RECDATA
            } else if (ObloqIICStatus == "HTTP_REQUESTFailed"){
                return "requestFailed"
            }
            _timeout += 1
            if (_timeout > timwout){
                return "timeOut"
            }
        }
    }
    /**
     * The HTTP get request.url(string):URL:time(ms): private long maxWait
     * @param time set timeout, eg: 10000
    */
    //% weight=79
    //% blockId=MicroitIoT_http_get
    //% block="http(get) | url %url| timeout(ms) %time"
    //% advanced=false
    export function ObloqIIC_http_get(url: string, time: number): string {
        ObloqIIC_ParaRunCommand(GET_URL, url)
        return ObloqIIC_http_wait_request(time);
    }

    /**
     * The HTTP post request.url(string): URL; content(string):content
     * time(ms): private long maxWait
     * @param time set timeout, eg: 10000
    */
    //% weight=78
    //% blockId=ObloqIIC_http_post
    //% block="http(post) | url %url| content %content| timeout(ms) %time"
    export function ObloqIIC_http_post(url: string, content: string, time: number): string {
        let tempStr = ""
        tempStr = url + "," + content;
        ObloqIIC_ParaRunCommand(POST_URL, tempStr)
        return ObloqIIC_http_wait_request(time);
    }

    /**
     * The HTTP put request,Obloq.put() can only be used for http protocol!
     * url(string): URL; content(string):content; time(ms): private long maxWait
     * @param time set timeout, eg: 10000
    */
    //% weight=77
    //% blockId=ObloqIIC_http_put
    //% block="http(put) | url %url| content %content| timeout(ms) %time"
    export function ObloqIIC_http_put(url: string, content: string, time: number): string {
        let tempStr = ""
        tempStr = url + "," + content;
        ObloqIIC_ParaRunCommand(PUT_URL, tempStr)
        return ObloqIIC_http_wait_request(time);
    }

    /**
     * Get IP address.
    */
    //% weight=51
    //% blockId=ObloqIIC_wifi_ipconfig
    //% block="ipconfig"
    //% advanced=true
    export function ObloqIIC_wifi_ipconfig(): string {
        return ObloqIIC_IP;
        //ObloqIIC_readValue(READ_IP)
    }


    /**
     * Send the ping.time(ms): private long maxWait
     * @param time to timeout, eg: 10000
    */
    //% weight=49
    //% blockId=Obloq_send_ping
    //% block="sendPing"
    //% advanced=true
    export function ObloqIIC_send_ping(): boolean {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E;
        buf[1] = RUN_COMMAND;
        buf[2] = SEND_PING;
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        ObloqIIC_CheckStatus("PingOK");
        /*
        while (true) {
            if (ObloqIICStatus == "PingOK") {
                break;
            }
            basic.pause(50);
        }*/
        return true;
    }


    /**
     * Get the software version.time(ms): private long maxWait
     * @param time to timeout, eg: 10000
    */
    //% weight=50
    //% blockId=ObloqIIC_get_version
    //% block="get version"
    //% advanced=true
    export function ObloqIIC_get_version(): string {
        let buf = pins.createBuffer(3);
        buf[0] = 0x1E;
        buf[1] = RUN_COMMAND;
        buf[2] = GET_VERSION;
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        ObloqIIC_CheckStatus("READ_VERSION");
        return RECDATA
    }


    /**
     * Heartbeat request.time(ms): private long maxWait
     * @param time to timeout, eg: 10000
    */
    //% weight=48
    //% blockId=ObloqIIC_get_heartbeat
    //% block="get heartbeat"
    //% advanced=true
    export function ObloqIIC_get_heartbeat(): boolean {
        return true
    }

    /**
     * Stop the heartbeat request.
    */
    //% weight=47
    //% blockId=ObloqIIC_stop_heartbeat
    //% block="stop heartbeat"
    //% advanced=true
    export function ObloqIIC_stop_heartbeat(): boolean {
        return true
    }

    function ObloqIIC_GetData(len: number): void {
        RECDATA = ""
        let tempbuf = pins.createBuffer(1)
        tempbuf[0] = 0x22
        pins.i2cWriteBuffer(IIC_ADDRESS, tempbuf);
        let tempRecbuf = pins.createBuffer(len)
        tempRecbuf = pins.i2cReadBuffer(IIC_ADDRESS, len, false)
        for (let i = 0; i < len; i++) {
            RECDATA += String.fromCharCode(tempRecbuf[i])
        }
    }

    function ObloqIIC_InquireStatus(): void {
        let buf = pins.createBuffer(3)
        let tempId = 0
        let tempStatus = 0
        buf[0] = 0x1E
        buf[1] = READ_STATUS
        buf[2] = 0x06
        pins.i2cWriteBuffer(IIC_ADDRESS, buf);
        let recbuf = pins.createBuffer(2)
        recbuf = pins.i2cReadBuffer(IIC_ADDRESS, 2, false)
        tempId = recbuf[0]
        tempStatus = recbuf[1]
        switch (tempId) {
            case READ_PING:
                if (tempStatus == PING_OK) {
                    ObloqIICStatus = "PingOK"
                } else {
                    ObloqIICStatus = "PingERR"
                }
                break;
            case READ_WIFISTATUS:
                if (tempStatus == WIFI_CONNECTING) {
                    ObloqIICStatus = "WiFiConnecting"
                } else if (tempStatus == WIFI_CONNECTED) {
                    ObloqIICStatus = "WiFiConnected"
                } else if (tempStatus == WIFI_DISCONNECT) {
                    ObloqIICStatus = "WiFiDisconnect"
                } else {
                }
                break;
            case READ_MQTTSTATUS:
                if (tempStatus == MQTT_CONNECTED) {
                    ObloqIICStatus = "MQTTConnected"
                } else if (tempStatus == MQTT_CONNECTERR) {
                    ObloqIICStatus = "MQTTConnectERR"
                }
                break;
            case READ_SUBSTATUS:
                if (tempStatus == SUB_TOPIC_OK) {
                    ObloqIICStatus = "SubTopicOK"
                } else if (tempStatus == SUB_TOPIC_Ceiling) {
                    ObloqIICStatus = "SubTopicCeiling"
                } else {
                    ObloqIICStatus = "SubTopicERR"
                }
                break;
            case READ_IP:
                ObloqIICStatus = "READ_IP"
                ObloqIIC_GetData(tempStatus)
                ObloqIIC_IP = RECDATA
                break;
            case SUB_TOPIC0:
                ObloqIICStatus = "READ_TOPICDATA"
                ObloqIIC_GetData(tempStatus)
                if (Topic0CallBack != null) {
                    Topic0CallBack();
                }
                break;
            case SUB_TOPIC1:
                ObloqIICStatus = "READ_TOPICDATA"
                ObloqIIC_GetData(tempStatus)
                if (Topic1CallBack != null) {
                    Topic1CallBack();
                }
                break;
            case SUB_TOPIC2:
                ObloqIICStatus = "READ_TOPICDATA"
                ObloqIIC_GetData(tempStatus)
                if (Topic2CallBack != null) {
                    Topic2CallBack();
                }
                break;
            case SUB_TOPIC3:
                ObloqIICStatus = "READ_TOPICDATA"
                ObloqIIC_GetData(tempStatus)
                if (Topic3CallBack != null) {
                    Topic3CallBack();
                }
                break;
            case SUB_TOPIC4:
                ObloqIICStatus = "READ_TOPICDATA"
                ObloqIIC_GetData(tempStatus)
                if (Topic4CallBack != null) {
                    Topic4CallBack();
                }
                break;
            case HTTP_REQUEST:
                ObloqIICStatus = "HTTP_REQUEST"
                ObloqIIC_GetData(tempStatus)
                break;
            case READ_VERSION:
                ObloqIICStatus = "READ_VERSION"
                ObloqIIC_GetData(tempStatus)
                break;
            default:
                break;
        }
        basic.pause(200);
    }
    basic.forever(function () {
        ObloqIIC_InquireStatus();
    })

} 
