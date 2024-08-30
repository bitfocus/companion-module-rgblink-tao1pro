import {
	DIAGRAM_POSITION_BOTTOM_LEFT,
	DIAGRAM_POSITION_BOTTOM_RIGHT,
	DIAGRAM_POSITION_MIDDLE_DEFAULT,
	DIAGRAM_POSITION_MIDDLE_MAXIMUM,
	DIAGRAM_POSITION_TOP_LEFT,
	DIAGRAM_POSITION_TOP_RIGHT,
	DIAGRAM_TYPE_HISTOGRAM,
	DIAGRAM_TYPE_VECTOR_DIAGRAM,
	DIAGRAM_TYPE_WAVEFORM_LUMINANCE,
	DIAGRAM_TYPE_WAVEFORM_RGB,
	DIAGRAM_VISIBILITY_OFF,
	DIAGRAM_VISIBILITY_OPEN,
	INPUT_TYPE_H264,
	INPUT_TYPE_MJPEG,
	INPUT_TYPE_RAW_VIDEO,
	PUSH_RESOLUTION_1280_720_30,
	PUSH_RESOLUTION_1280_720_60,
	PUSH_RESOLUTION_1920_1080_30,
	PUSH_RESOLUTION_1920_1080_60,
	PUSH_RESOLUTION_640_480_30,
	PUSH_RESOLUTION_640_480_60,
	RGBLinkTAO1ProConnector,
	ROTATION_0,
	ROTATION_180,
	ROTATION_270,
	ROTATION_90,
	Tao1InputType,
	Tao1PushResolution,
	Tao1RotationTypes,
} from '../rgblink_tao1pro_connector.js'
import { ApiConfig } from 'companion-rgblink-openapi-connector'

const TEST_PORT = 25000

let api: RGBLinkTAO1ProConnector | undefined = undefined

afterEach(() => {
	if (api !== undefined) {
		api.onDestroy()
	}
})

test('isValidRotation', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isValidRotation(ROTATION_0)).toBe(true)
	expect(api.isValidRotation(ROTATION_90)).toBe(true)
	expect(api.isValidRotation(ROTATION_180)).toBe(true)
	expect(api.isValidRotation(ROTATION_270)).toBe(true)
	expect(api.isValidRotation(4 as Tao1RotationTypes)).toBe(false)
})

test('isDiagramTypeValid', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isDiagramTypeValid(DIAGRAM_TYPE_HISTOGRAM)).toBe(true)
	expect(api.isDiagramTypeValid(DIAGRAM_TYPE_VECTOR_DIAGRAM)).toBe(true)
	expect(api.isDiagramTypeValid(DIAGRAM_TYPE_WAVEFORM_LUMINANCE)).toBe(true)
	expect(api.isDiagramTypeValid(DIAGRAM_TYPE_WAVEFORM_RGB)).toBe(true)
	expect(api.isDiagramTypeValid(4)).toBe(false)
})

test('isDiagramVisibilityValid', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isDiagramVisibilityValid(DIAGRAM_VISIBILITY_OFF)).toBe(true)
	expect(api.isDiagramVisibilityValid(DIAGRAM_VISIBILITY_OPEN)).toBe(true)
	expect(api.isDiagramVisibilityValid(2)).toBe(false)
})

test('isDiagramPositionValid', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_BOTTOM_LEFT)).toBe(true)
	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_BOTTOM_RIGHT)).toBe(true)
	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_MIDDLE_DEFAULT)).toBe(true)
	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_MIDDLE_MAXIMUM)).toBe(true)
	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_TOP_LEFT)).toBe(true)
	expect(api.isDiagramPositionValid(DIAGRAM_POSITION_TOP_RIGHT)).toBe(true)

	expect(api.isDiagramPositionValid(6)).toBe(false)
})

test('isInputTypeValid', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isInputTypeValid(INPUT_TYPE_H264)).toBe(true)
	expect(api.isInputTypeValid(INPUT_TYPE_MJPEG)).toBe(true)
	expect(api.isInputTypeValid(INPUT_TYPE_RAW_VIDEO)).toBe(true)

	expect(api.isInputTypeValid(4 as Tao1InputType)).toBe(false)
})

test('isPushResolutionValid', async () => {
	api = new RGBLinkTAO1ProConnector(new ApiConfig('localhost', TEST_PORT, false, false))

	expect(api.isPushResolutionValid(PUSH_RESOLUTION_1920_1080_60)).toBe(true)
	expect(api.isPushResolutionValid(PUSH_RESOLUTION_1920_1080_30)).toBe(true)
	expect(api.isPushResolutionValid(PUSH_RESOLUTION_1280_720_60)).toBe(true)
	expect(api.isPushResolutionValid(PUSH_RESOLUTION_1280_720_30)).toBe(true)
	expect(api.isPushResolutionValid(PUSH_RESOLUTION_640_480_60)).toBe(true)
	expect(api.isPushResolutionValid(PUSH_RESOLUTION_640_480_30)).toBe(true)

	expect(api.isPushResolutionValid(0 as Tao1PushResolution)).toBe(false)
	expect(api.isPushResolutionValid(1 as Tao1PushResolution)).toBe(false)
	expect(api.isPushResolutionValid(22 as Tao1PushResolution)).toBe(false)
	expect(api.isPushResolutionValid(25 as Tao1PushResolution)).toBe(false)
})
