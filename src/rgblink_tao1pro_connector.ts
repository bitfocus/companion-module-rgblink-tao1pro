import { RGBLinkApiConnector, ApiConfig, PollingCommand, Hex } from 'companion-rgblink-openapi-connector'

export const SRC_HDMI1 = 0 as const
export const SRC_HDMI2 = 1
export const SRC_UVC1 = 2
export const SRC_UVC2 = 3
export const SRC_NAMES: string[] = []
SRC_NAMES[SRC_HDMI1] = 'HDMI 1'
SRC_NAMES[SRC_HDMI2] = 'HDMI 2'
SRC_NAMES[SRC_UVC1] = 'UVC 1'
SRC_NAMES[SRC_UVC2] = 'UVC 2'

export const DIAGRAM_TYPE_HISTOGRAM = 0
export const DIAGRAM_TYPE_VECTOR_DIAGRAM = 1
export const DIAGRAM_TYPE_WAVEFORM_LUMINANCE = 2
export const DIAGRAM_TYPE_WAVEFORM_RGB = 3
export const DIAGRAM_TYPE_NAMES: string[] = []
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_HISTOGRAM] = 'Histogram'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_VECTOR_DIAGRAM] = 'Vector diagram'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_WAVEFORM_LUMINANCE] = 'Waveform - luminance'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_WAVEFORM_RGB] = 'Waveform - RGB'

export const DIAGRAM_VISIBILITY_OFF = 0
export const DIAGRAM_VISIBILITY_OPEN = 1
export const DIAGRAM_VISIBILITY_NAMES: string[] = []
DIAGRAM_VISIBILITY_NAMES[DIAGRAM_VISIBILITY_OFF] = 'Off'
DIAGRAM_VISIBILITY_NAMES[DIAGRAM_VISIBILITY_OPEN] = 'Open'

export const DIAGRAM_POSITION_MIDDLE_DEFAULT = 0
export const DIAGRAM_POSITION_MIDDLE_MAXIMUM = 1
export const DIAGRAM_POSITION_BOTTOM_LEFT = 2
export const DIAGRAM_POSITION_BOTTOM_RIGHT = 3
export const DIAGRAM_POSITION_TOP_LEFT = 4
export const DIAGRAM_POSITION_TOP_RIGHT = 5
export const DIAGRAM_POSITION_NAMES: string[] = []
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_MIDDLE_DEFAULT] = 'Middle'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_MIDDLE_MAXIMUM] = 'Middle - maximum'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_BOTTOM_LEFT] = 'Bottom left'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_BOTTOM_RIGHT] = 'Bottom right'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_TOP_LEFT] = 'Top left'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_TOP_RIGHT] = 'Top right'

export const INPUT_TYPE_MJPEG = 0
export const INPUT_TYPE_RAW_VIDEO = 1
export const INPUT_TYPE_H264 = 2
export type Tao1InputType = 0 | 1 | 2

export const BLUETOOTH_STATUS_0_ = 0
export const BLUETOOTH_STATUS_1_PAIRED = 1
export const BLUETOOTH_STATUS_2_CONNECTED = 2
export type Tao1BlootoothStatusType = 0 | 1 | 2

export const NDI_CONNECTION_MODE_UNICAST = 0
export const NDI_CONNECTION_MODE_MULTICAST = 1
export type Tao1NDIConnectionMode = 0 | 1

export const BATTERY_STATUS_0_NOT_PLUGEED = 0
export const BATTERY_STATUS_1_OF_5 = 1
export const BATTERY_STATUS_2_OF_5 = 2
export const BATTERY_STATUS_3_OF_5 = 3
export const BATTERY_STATUS_4_OF_5 = 4
export const BATTERY_STATUS_5_OF_5 = 5
export type Tao1BatteryStatus = 0 | 1 | 2 | 3 | 4 | 5

export const INPUT_AUDIO_ANALOG = 0
export const INPUT_AUDIO_HDMI1 = 1
export const INPUT_AUDIO_HDMI2 = 2
export type Tao1AudioInput = 0 | 1 | 2

const pollingCommands: PollingCommand[] = [
	new PollingCommand('78', '02', '00', '00', '00'), // 3.2.20 Read the master and secondary channel
]

class Tao1Diagram {
	type: number | undefined
	visibility: number | undefined
	position: number | undefined
}

class Tao1InputStatus {
	type: Tao1InputType | undefined
	width: number | undefined
	height: number | undefined
	frequency: number | undefined
}

class Tao1BluetoothSingleDeviceStatus {
	constructor(hexAddres: string, name: string, status: Tao1BlootoothStatusType) {
		this.hexAddres = hexAddres
		this.name = name
		this.status = status
	}
	hexAddres: string
	name: string
	status: Tao1BlootoothStatusType
}

class Tao1BluetoothStatus {
	numOfDevices: number | undefined
	devices: Tao1BluetoothSingleDeviceStatus[] = []
	enabled: true | false | undefined
}

class Tao1NDIConnectionStatus {
	mode: Tao1NDIConnectionMode | undefined
	ttl: number | undefined
	ipHex: string | undefined
	netMaskHex: string | undefined
}

class Tao1NDIEncodingSettings {
	width: number | undefined
	height: number | undefined
	frequency: number | undefined
	fps: number | undefined
	bitrate: number | undefined
	sampleRate: number | undefined
}

class Tao1NDIStatus {
	switchNDIEnabled: true | false | undefined
	groupName: string | undefined
	channelName: string | undefined
	deviceName: string | undefined
	connection: Tao1NDIConnectionStatus = new Tao1NDIConnectionStatus()
	encodingSettings: Tao1NDIEncodingSettings = new Tao1NDIEncodingSettings()
}

class Tao1ConnectionStatus {
	netmaskHex: string | undefined
	ipHex: string | undefined
	gatewayHex: string | undefined
	macHex: string | undefined
}

class Tao1RecordingStatus {
	fileName: string | undefined
	isEnabled: true | false | undefined
}

class Tao1Firmware {
	softwareMajor: string | undefined
	softwareMinor: string | undefined
	kernelMajor: string | undefined
	kernelMinor: string | undefined
}

class Tao1DeviceStatus {
	constructor() {
		this.inputs[SRC_HDMI1] = new Tao1InputStatus()
		this.inputs[SRC_HDMI2] = new Tao1InputStatus()
		this.inputs[SRC_UVC1] = new Tao1InputStatus()
		this.inputs[SRC_UVC1] = new Tao1InputStatus()
	}

	previewSourceMainChannel: number | undefined
	programSourceMainChannel: number | undefined
	programSourceSubChannel: number | undefined
	diagram: Tao1Diagram = new Tao1Diagram()
	recordingStatus: Tao1RecordingStatus = new Tao1RecordingStatus()
	inputs: Tao1InputStatus[] = []
	bluetooth: Tao1BluetoothStatus = new Tao1BluetoothStatus()
	ndi: Tao1NDIStatus = new Tao1NDIStatus()
	networkStatus: Tao1ConnectionStatus = new Tao1ConnectionStatus()
	uDiskInserted: true | false | undefined
	batteries: Tao1BatteryStatus[] = []
	powerSupplyByUSBc: true | false | undefined
	pushStatusHex: string | undefined
	audio: Tao1AudioInput | undefined
	firmware: Tao1Firmware = new Tao1Firmware()
}

export class RGBLinkTAO1ProConnector extends RGBLinkApiConnector {
	static EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = new Tao1DeviceStatus()

	constructor(config: ApiConfig) {
		super(config, pollingCommands)
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this

		this.on(RGBLinkTAO1ProConnector.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, (message: string /*, metadata*/) => {
			this.myDebug('Not standard data:' + message)
			// if (metadata.size == 22) {
			// 	self.consume22(message)
			// 	this.emit(this.EVENT_NAME_ON_DEVICE_STATE_CHANGED, [])
			// } else {
			// 	//self.status(this.STATUS_WARNING, "Unknown message length:" + metadata.size)
			// }
		})

		this.on(
			RGBLinkTAO1ProConnector.EVENT_NAME_ON_DATA_API,
			(ADDR: Hex, SN: Hex, CMD: Hex, DAT1: Hex, DAT2: Hex, DAT3: Hex, DAT4: Hex) => {
				self.consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
				this.emit(RGBLinkTAO1ProConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, undefined)
			}
		)
	}

	public sendSwitchPreview(src: number): void {
		if (this.isValidSource(src)) {
			this.sendCommand('78', '00' /*write on preview*/, this.byteToTwoSignHex(src), '00', '00')
		} else {
			this.myDebug('Wrong source number: ' + src)
		}
	}

	public sendSwitchProgram(src: number): void {
		if (this.isValidSource(src)) {
			this.sendCommand('78', '01' /*write on program*/, this.byteToTwoSignHex(src), '00', '00')
		} else {
			this.myDebug('Wrong source number: ' + src)
		}
	}

	public sendSetDiagramState(visibility: number, type: number, position: number): void {
		if (
			this.isDiagramTypeValid(type) &&
			this.isDiagramVisibilityValid(visibility) &&
			this.isDiagramPositionValid(position)
		) {
			this.sendCommand(
				'C7',
				'00',
				this.byteToTwoSignHex(type),
				this.byteToTwoSignHex(visibility),
				this.byteToTwoSignHex(position)
			)
		} else {
			this.myDebug(
				'At last one wrong parameter. Visibility:' + visibility + ', type:' + type + ', position:' + position
			)
		}
	}

	private isValidSource(src: number) {
		return src in SRC_NAMES
	}

	private isDiagramTypeValid(type: number) {
		return type in DIAGRAM_TYPE_NAMES
	}

	private isDiagramVisibilityValid(visibility: number) {
		return visibility in DIAGRAM_VISIBILITY_NAMES
	}

	private isDiagramPositionValid(position: number) {
		return position in DIAGRAM_POSITION_NAMES
	}

	private consumeFeedback(ADDR: Hex, SN: Hex, CMD: Hex, DAT1: Hex, DAT2: Hex, DAT3: Hex, DAT4: Hex): void {
		const redeableMsg = [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4].join(' ')

		try {
			if (CMD == '78') {
				if (DAT1 == '00') {
					// 3.2.18 Switch over the pvw screen input source
					const src = parseInt(DAT2)
					if (this.isValidSource(src)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.previewSourceMainChannel = src
						this.logFeedback(
							redeableMsg,
							`Switch over the preview screen to input source ${SRC_NAMES[this.deviceStatus.previewSourceMainChannel]}`
						)
						return
					}
				} else if (DAT1 == '01') {
					// 3.2.19 Switch over the pgm screen input source
					const src = parseInt(DAT2)
					if (this.isValidSource(src)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.programSourceMainChannel = src
						this.logFeedback(
							redeableMsg,
							`Switch over the program screen to input source ${SRC_NAMES[this.deviceStatus.programSourceMainChannel]}`
						)
						return
					}
				}
			} else if (CMD == 'C7') {
				if (DAT1 == '00' || DAT1 == '01') {
					// 3.2.44 Waveform diagram, vector diagram, and histogram:
					const type = parseInt(DAT2)
					const visibility = parseInt(DAT3)
					const position = parseInt(DAT4)
					if (
						this.isDiagramTypeValid(type) &&
						this.isDiagramVisibilityValid(visibility) &&
						this.isDiagramPositionValid(position)
					) {
						this.emitConnectionStatusOK()
						this.deviceStatus.diagram.type = type
						this.deviceStatus.diagram.visibility = visibility
						this.deviceStatus.diagram.position = position
						this.logFeedback(
							redeableMsg,
							`Diagram visibility: ${DIAGRAM_VISIBILITY_NAMES[visibility]}, type: ${DIAGRAM_TYPE_NAMES[type]}, position: ${DIAGRAM_POSITION_NAMES[position]}`
						)
						return
					}
				}
			}
		} catch (ex) {
			console.log(ex)
		}

		this.myDebug('Unrecognized feedback message:' + redeableMsg)
	}

	private emitConnectionStatusOK() {
		this.emit(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_OK, [])
	}
}
