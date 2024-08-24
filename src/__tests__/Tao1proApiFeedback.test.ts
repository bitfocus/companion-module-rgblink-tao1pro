import {
	BLUETOOTH_STATUS_0_,
	INPUT_TYPE_H264,
	INPUT_TYPE_MJPEG,
	INPUT_TYPE_RAW_VIDEO,
	NDI_CONNECTION_MODE_UNICAST,
	RGBLinkTAO1ProConnector,
	SRC_HDMI1,
	SRC_HDMI2,
	SRC_UVC1,
	SRC_UVC2,
} from '../rgblink_tao1pro_connector.js'
import { ApiConfig } from 'companion-rgblink-openapi-connector'

const TEST_PORT = 25000

let api: RGBLinkTAO1ProConnector | undefined = undefined

afterEach(() => {
	if (api !== undefined) {
		api.onDestroy()
	}
})

// The TAO1PRO central control protocol CMD uses 0xf0 (write) and 0 x f) to represent the 0xf1 (read) of long commands;

test('API properly reads feedback 3.2.1 Read the HDMI and UVC Wide and Higher Information (0xF1 0xB3)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F004B' + 'F1' + 'B3' + '01' + '0700' + 'F7>01 80 07 38 04 3c 00'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.inputs[SRC_HDMI2].type).toEqual(INPUT_TYPE_RAW_VIDEO)
	expect(api.deviceStatus.inputs[SRC_HDMI2].width).toEqual(0x0780) // 1920
	expect(api.deviceStatus.inputs[SRC_HDMI2].height).toEqual(0x0438) // 1080
	expect(api.deviceStatus.inputs[SRC_HDMI2].frequency).toEqual(0x3c) // 60 [Hz]

	api.onDataReceived(Buffer.from('<F0000' + 'F1' + 'B3' + '00' + '0700' + 'AB>00 00 04 00 03 32 39')) // mjpeg 1024x768x50
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.inputs[SRC_HDMI1].type).toEqual(INPUT_TYPE_MJPEG)
	expect(api.deviceStatus.inputs[SRC_HDMI1].width).toEqual(1024)
	expect(api.deviceStatus.inputs[SRC_HDMI1].height).toEqual(768)
	expect(api.deviceStatus.inputs[SRC_HDMI1].frequency).toEqual(50)

	api.onDataReceived(Buffer.from('<F0000' + 'F1' + 'B3' + '02' + '0700' + 'AD>02 58 05 00 03 19 7B')) // h264 1366x768x25
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.inputs[SRC_UVC1].type).toEqual(INPUT_TYPE_H264)
	expect(api.deviceStatus.inputs[SRC_UVC1].width).toEqual(1366)
	expect(api.deviceStatus.inputs[SRC_UVC1].height).toEqual(768)
	expect(api.deviceStatus.inputs[SRC_UVC1].frequency).toEqual(25)

	api.onDataReceived(Buffer.from('<F0000' + 'F1' + 'B3' + '03' + '0700' + 'AE>02 00 06 60 03 18 83')) // h264 1536x864x24
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.inputs[SRC_UVC2].type).toEqual(INPUT_TYPE_H264)
	expect(api.deviceStatus.inputs[SRC_UVC2].width).toEqual(1366)
	expect(api.deviceStatus.inputs[SRC_UVC2].height).toEqual(864)
	expect(api.deviceStatus.inputs[SRC_UVC2].frequency).toEqual(24)
})

test('API properly reads feedback 3.2.2 Setting Wide information for HDMI and UVC (0xF0 0xB3)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0046F0B3020800F3>'))
	// noting to check/write?
	// is it real feedback for command <T0046f0b3020800f3>01 00 00 05 d0 02 1e f6    ???
	fail()
})

test('API properly reads feedback 3.2.3 Set up the rtmp push flow switch and url (0xF0 0xB4)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0056F0B40021001B>'))
	// noting to check/write?
	// is it real feedback for command <T0056f0b40021001b>00 22 72 74 6d 70 3a 2f 2f 31 39 32 2e 31 36 38 2e 30 2e 37 36 2f 6c 69 76 65 2f 74 65 73 74 22 cf    ???
	fail()
})

test('API properly reads feedback 3.2.4 Set the code rate (0xF0 0xB5)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0035f0b5000500df>'))
	// noting to check/write?
	// is it real feedback for command <T0035f0b5000500df>00 18 70 17 9f    ???
	fail()
})

test('API properly reads feedback 3.2.5 Read the file name being recorded (0xF1 0x45)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(
		Buffer.from(
			'<F0000f1450026005c>2F 6D 65 64 69 61 2F 75 73 62 30 2F 72 65 63 6F 72 64 5F 32 30 31 33 30 31 31 38 30 39 35 37 34 35 2E 6D 70 34 F2'
		)
	)
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.recordingFileName).toEqual('/media/usb0/record_20130118095745.mp4')
})

test('API properly reads feedback 3.2.6 Bluetooth access to scanning device information (0xF1 0xB4)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(
		Buffer.from(
			'<F0011f1b4004d0003>03 00 7f 21 a1 3e 26 37 11 37 46 2d 32 31 2d 41 31 2d 33 45 2d 32 36 2d 33 37 00 7b c1 26 60 ff be 11 37 42 2d 43 31 2d 32 36 2d 36 30 2d 46 46 2d 42 45 00 69 af fc d4 f7 d6 11 36 39 2d 41 46 2d 46 43 2d 44 34 2d 46 37 2d 44 36 41'
		)
	)
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.bluetooth.numOfDevices).toEqual(3)
	expect(api.deviceStatus.bluetooth.devices.length).toEqual(3)

	expect(api.deviceStatus.bluetooth.devices[0].status).toEqual(BLUETOOTH_STATUS_0_)
	expect(api.deviceStatus.bluetooth.devices[0].hexAddres).toEqual('7f21a13e2637')
	expect(api.deviceStatus.bluetooth.devices[0].name).toEqual('7F-21-A1-3E-26-37')

	expect(api.deviceStatus.bluetooth.devices[1].status).toEqual(BLUETOOTH_STATUS_0_)
	expect(api.deviceStatus.bluetooth.devices[1].hexAddres).toEqual('7bc12660ffbe')
	expect(api.deviceStatus.bluetooth.devices[1].name).toEqual('7B-C1-26-60-FF-BE')

	expect(api.deviceStatus.bluetooth.devices[2].status).toEqual(BLUETOOTH_STATUS_0_)
	expect(api.deviceStatus.bluetooth.devices[2].hexAddres).toEqual('69-af-fc-d4-f7-d6')
	expect(api.deviceStatus.bluetooth.devices[2].name).toEqual('69-AF-FC-D4-F7-D6')
})

test('API properly reads feedback 3.2.7 Bluetooth Connect to a device (0xF0 0xB6)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0021f0b6000000c7>ff ff 12 04 4f 9d 00'))
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.8 Bluetooth Disconnect a device (0xF0 0xB7)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F002af0b7000000d1>ff ff 12 04 4f 9d 00'))
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.9 NDI Group Name Read (0xF1 0xB8 0x00)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0045f1b8000700f5>50 75 62 6c 69 63 5f'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.ndi.groupName).toEqual('Public')
})

test('API properly reads feedback 3.2.10 NDI Group Name Modification (0xF0 0xB8 0x00)', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F004df0b8000800fd>'))
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.11 NDI channel name read', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0045f1b8010700f6>50 75 62 6c 69 63 5f'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.ndi.channelName).toEqual('Public')
})

test('API properly reads feedback 3.2.12 NDI channel name modification', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F004df0b8010800fe>'))
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.13 NDI device name read', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0045f1b8020700f5>50 75 62 6c 69 63 f7'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.ndi.deviceName).toEqual('Public')
})

test('API properly reads feedback 3.2.14 NDI device name modification', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F004df0b8020800fF>'))
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.15 Read the NDI connection mode and ttl, addr, and netmask', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(
		Buffer.from('<F0000' + 'F1' + 'B8' + '03' + '0A00B6>00 7F ' + 'C0 A8 00 01' + 'FF FF FF 00' + 'E5')
	)
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.ndi.connection.mode).toEqual(NDI_CONNECTION_MODE_UNICAST)
	expect(api.deviceStatus.ndi.connection.ttl).toEqual(127)
	expect(api.deviceStatus.ndi.connection.ipHex).toEqual('C0A80001')
	expect(api.deviceStatus.ndi.connection.netMaskHex).toEqual('FFFFFF00')
})

test('API properly reads feedback 3.2.16 Set up the NDI connection mode and ttl, addr, netmask', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + 'F1' + 'B8' + '03' + '0A00B6>')) // is it real command
	await new Promise((r) => setTimeout(r, 1))
	// what should be tested?
	fail()
})

test('API properly reads feedback 3.2.17 Read the NDI resolution, frame rate, code rate, and audio format', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(
		Buffer.from('<F0000' + 'F1' + 'B8' + '04' + '0A00B6>' + '00 04 ' + '00 03 ' + '32 18 ' + ' E8 03 F4 01 ' + '31')
		// 1024 x 786, 50hz, 24 fps, 1000 bitrate, 500 sample rate
	)
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.ndi.encodingSettings.width).toEqual(1024)
	expect(api.deviceStatus.ndi.encodingSettings.height).toEqual(768)
	expect(api.deviceStatus.ndi.encodingSettings.frequency).toEqual(50)
	expect(api.deviceStatus.ndi.encodingSettings.fps).toEqual(24)
	expect(api.deviceStatus.ndi.encodingSettings.bitrate).toEqual(1000)
	expect(api.deviceStatus.ndi.encodingSettings.sampleRate).toEqual(500)
})

test('API properly reads feedback 3.2.18 (preview input) ', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '78' + '00' + '00' + '000078>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.previewSourceMainChannel).toEqual(SRC_HDMI1)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '00' + '01' + '000079>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.previewSourceMainChannel).toEqual(SRC_HDMI2)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '00' + '02' + '00007A>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.previewSourceMainChannel).toEqual(SRC_UVC1)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '00' + '03' + '00007B>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.previewSourceMainChannel).toEqual(SRC_UVC2)
})

test('API properly reads feedback 3.2.19 Switch over the pgm screen input source', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '78' + '01' + '00' + '000079>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.programSourceMainChannel).toEqual(SRC_HDMI1)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '01' + '01' + '00007A>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.programSourceMainChannel).toEqual(SRC_HDMI2)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '01' + '02' + '00007B>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.programSourceMainChannel).toEqual(SRC_UVC1)

	api.onDataReceived(Buffer.from('<F0000' + '78' + '01' + '03' + '00007C>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.programSourceMainChannel).toEqual(SRC_UVC2)
})

// From support e-mail:
// "Also for the PIP built problems, as we checked Tao1 pro does not support PIP module for new versions"
// so following are not implemented in tests
// 3.2.20 Read the master and secondary channel

test('API properly reads feedback 3.2.21 Read the subnet mask', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '85' + 'FF' + 'FF' + 'FF' + '00' + '82>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.networkStatus.netmaskHex).toEqual('FFFFFF00')
})

test('API properly reads feedback 3.2.22 Read the IP address', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '89' + 'C0' + 'A8' + '00' + '01' + 'F2>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.networkStatus.ipHex).toEqual('C0A80001')
})

test('API properly reads feedback 3.2.23 Read the gateway', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '82' + 'C0' + 'A8' + '00' + '01' + 'EB>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.networkStatus.gatewayHex).toEqual('C0A80001')
})

test('API properly reads feedback 3.2.24 Read Ethernet MAC Address Top 3 B A T E:  &  3.2.25 After reading the Ethernet MAC address, 3 B A T E:', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	api.onDataReceived(Buffer.from('<F0000' + '8E' + '21' + 'A8' + '00' + '01' + '58>'))
	api.onDataReceived(Buffer.from('<F0000' + '8E' + '23' + 'EE' + 'EF' + '02' + '90>'))
	await new Promise((r) => setTimeout(r, 1))
	expect(api.deviceStatus.networkStatus.gatewayHex).toEqual('A80001EEEF02')
})
