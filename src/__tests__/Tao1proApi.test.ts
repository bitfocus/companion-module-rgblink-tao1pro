import { RGBLinkTAO1ProConnector, SRC_HDMI1, SRC_HDMI2, SRC_UVC1, SRC_UVC2 } from '../rgblink_tao1pro_connector.js'
import { ApiConfig } from 'companion-rgblink-openapi-connector'

const TEST_PORT = 25000

let api: RGBLinkTAO1ProConnector | undefined = undefined

afterEach(() => {
	if (api !== undefined) {
		api.onDestroy()
	}
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
