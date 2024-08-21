import {
	BLUETOOTH_STATUS_0_,
	INPUT_TYPE_H264,
	INPUT_TYPE_MJPEG,
	INPUT_TYPE_RAW_VIDEO,
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
	// given connectore setted up with enabled polling
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
	// given connectore setted up with enabled polling
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0046F0B3020800F3>'))
	// noting to check/write?
	// is it real feedback for command <T0046f0b3020800f3>01 00 00 05 d0 02 1e f6    ???
})

test('API properly reads feedback 3.2.3 Set up the rtmp push flow switch and url (0xF0 0xB4)', async () => {
	// given connectore setted up with enabled polling
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0056F0B40021001B>'))
	// noting to check/write?
	// is it real feedback for command <T0056f0b40021001b>00 22 72 74 6d 70 3a 2f 2f 31 39 32 2e 31 36 38 2e 30 2e 37 36 2f 6c 69 76 65 2f 74 65 73 74 22 cf    ???
})

test('API properly reads feedback 3.2.4 Set the code rate (0xF0 0xB5)', async () => {
	// given connectore setted up with enabled polling
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))
	api.onDataReceived(Buffer.from('<F0035f0b5000500df>'))
	// noting to check/write?
	// is it real feedback for command <T0035f0b5000500df>00 18 70 17 9f    ???
})

test('API properly reads feedback 3.2.5 Read the file name being recorded (0xF1 0x45)', async () => {
	// given connectore setted up with enabled polling
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
	// given connectore setted up with enabled polling
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

test('API properly reads feedback 3.2.18 (preview input) ', async () => {
	// given connectore setted up with enabled polling
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
