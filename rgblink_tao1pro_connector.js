const RGBLinkApiConnector = require('./rgblinkapiconnector')

const SRC_HDMI1 = 0
const SRC_HDMI2 = 1
const SRC_UVC1 = 2
const SRC_UVC2 = 3
const SRC_NAMES = []
SRC_NAMES[SRC_HDMI1] = 'HDMI 1'
SRC_NAMES[SRC_HDMI2] = 'HDMI 2'
SRC_NAMES[SRC_UVC1] = 'UVC 1'
SRC_NAMES[SRC_UVC2] = 'UVC 2'

const PIP_OFF = 0
const PIP_ON = 1
const PIP_STATUES_NAMES = []
PIP_STATUES_NAMES[PIP_OFF] = 'Normal mode (PIP OFF)'
PIP_STATUES_NAMES[PIP_ON] = 'PIP mode (PIP ON)'

const PIP_MODE_TOP_LEFT = 0
const PIP_MODE_TOP_RIGHT = 1
const PIP_MODE_BOTTOM_LEFT = 2
const PIP_MODE_BOTTOM_RIGHT = 3
const PIP_MODE_NAMES = []
PIP_MODE_NAMES[PIP_MODE_TOP_LEFT] = 'Top left'
PIP_MODE_NAMES[PIP_MODE_TOP_RIGHT] = 'Top right'
PIP_MODE_NAMES[PIP_MODE_BOTTOM_LEFT] = 'Bottom left'
PIP_MODE_NAMES[PIP_MODE_BOTTOM_RIGHT] = 'Bottom right'

const DIAGRAM_TYPE_HISTOGRAM = 0
const DIAGRAM_TYPE_VECTOR_DIAGRAM = 1
const DIAGRAM_TYPE_WAVEFORM_LUMINANCE = 2
const DIAGRAM_TYPE_WAVEFORM_RGB = 3
const DIAGRAM_TYPE_NAMES = []
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_HISTOGRAM] = 'Histogram'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_VECTOR_DIAGRAM] = 'Vector diagram'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_WAVEFORM_LUMINANCE] = 'Waveform - luminance'
DIAGRAM_TYPE_NAMES[DIAGRAM_TYPE_WAVEFORM_RGB] = 'Waveform - RGB'

const DIAGRAM_VISIBILITY_OFF = 0
const DIAGRAM_VISIBILITY_OPEN = 1
const DIAGRAM_VISIBILITY_NAMES = []
DIAGRAM_VISIBILITY_NAMES[DIAGRAM_VISIBILITY_OFF] = 'Off'
DIAGRAM_VISIBILITY_NAMES[DIAGRAM_VISIBILITY_OPEN] = 'Open'

const DIAGRAM_POSITION_MIDDLE_DEFAULT = 0
const DIAGRAM_POSITION_MIDDLE_MAXIMUM = 1
const DIAGRAM_POSITION_BOTTOM_LEFT = 2
const DIAGRAM_POSITION_BOTTOM_RIGHT = 3
const DIAGRAM_POSITION_TOP_LEFT = 4
const DIAGRAM_POSITION_TOP_RIGHT = 5
const DIAGRAM_POSITION_NAMES = []
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_MIDDLE_DEFAULT] = 'Middle'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_MIDDLE_MAXIMUM] = 'Middle - maximum'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_BOTTOM_LEFT] = 'Bottom left'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_BOTTOM_RIGHT] = 'Bottom right'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_TOP_LEFT] = 'Top left'
DIAGRAM_POSITION_NAMES[DIAGRAM_POSITION_TOP_RIGHT] = 'Top right'

class RGBLinkTAO1ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		previewSourceMainChannel: undefined,
		programSourceMainChannel: undefined,
		programSourceSubChannel: undefined,
		pipStatus: undefined,
		pipMode: undefined,
		diagram: {
			type: undefined,
			visibility: undefined,
			position: undefined,
		},
	}

	constructor(host, port, debug, polling) {
		super(host, port, debug, polling)
		var self = this

		this.on(this.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, (message /*, metadata*/) => {
			this.debug('Not standard data:' + message)
			// if (metadata.size == 22) {
			// 	self.consume22(message)
			// 	this.emit(this.EVENT_NAME_ON_DEVICE_STATE_CHANGED, [])
			// } else {
			// 	//self.status(this.STATUS_WARNING, "Unknown message length:" + metadata.size)
			// }
		})

		this.on(this.EVENT_NAME_ON_DATA_API, (ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) => {
			self.consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4)
			this.emit(this.EVENT_NAME_ON_DEVICE_STATE_CHANGED, [])
		})
	}

	sendConnectMessage() {
		//this.sendCommand('68', '66', '01' /*Connect*/, '00', '00')
	}

	sendDisconnectMessage() {
		//this.sendCommand('68', '66', '00' /*Disconnect*/, '00', '00')
	}

	askAboutStatus() {
		this.sendCommand('78', '02', '00', '00', '00') // 3.2.20 Read the master and secondary channel
		this.sendCommand('C7', '01' /*read*/, '00', '00', '00') // 3.2.44 Waveform diagram, vector diagram, and histogram:
	}

	sendSwitchPreview(src) {
		if (this.isValidSource(src)) {
			this.sendCommand('78', '00' /*write on preview*/, this.byteToTwoSignHex(src), '00', '00')
		} else {
			this.debug('Wrong source number: ' + src)
		}
	}

	sendSwitchProgram(src) {
		if (this.isValidSource(src)) {
			this.sendCommand('78', '01' /*write on program*/, this.byteToTwoSignHex(src), '00', '00')
		} else {
			this.debug('Wrong source number: ' + src)
		}
	}

	sendSetPIPStatusAndMode(pipStatus, pipMode) {
		if (pipStatus == PIP_OFF) {
			this.sendCommand('68', 'AA', this.byteToTwoSignHex(PIP_OFF), '00', '00')
		} else if (pipStatus == PIP_ON) {
			if (this.isValidPipMode(pipMode)) {
				this.sendCommand('68', 'AA', this.byteToTwoSignHex(PIP_ON), this.byteToTwoSignHex(pipMode), '00')
			} else {
				this.debug('Wrong PIP mode:' + pipMode)
			}
		} else {
			this.debug('Wrong PIP status:' + pipStatus)
		}
	}

	sendSetDiagramState(visibility, type, position) {
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
			this.debug('At last one wrong parameter. Visibility:' + visibility + ', type:' + type, ', position:' + position)
		}
	}

	isValidSource(src) {
		return src in SRC_NAMES
	}

	isValidPipMode(pipMode) {
		return pipMode in PIP_MODE_NAMES
	}

	isDiagramTypeValid(type) {
		return type in DIAGRAM_TYPE_NAMES
	}

	isDiagramVisibilityValid(visibility) {
		return visibility in DIAGRAM_VISIBILITY_NAMES
	}

	isDiagramPositionValid(position) {
		return position in DIAGRAM_POSITION_NAMES
	}

	consumeFeedback(ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4) {
		let redeableMsg = [ADDR, SN, CMD, DAT1, DAT2, DAT3, DAT4].join(' ')

		// let importantPart = CMD + DAT1 + DAT2 + DAT3 + DAT4
		// if ('F140011600' == importantPart) {
		// 	// readed status, it's ok
		// 	this.emitConnectionStatusOK()
		// 	return this.logFeedback(redeableMsg, 'Status readed')
		// } else if (CMD == 'A2' && DAT1 == '18') {
		// 	// t-bar position update
		// 	this.emitConnectionStatusOK()
		// 	return this.logFeedback(redeableMsg, 'T-BAR position changed')
		// }

		if (CMD == '68') {
			if (DAT1 == 'AA') {
				//3.2.30 Display mode:
				let pipS = parseInt(DAT2)
				if (pipS == PIP_OFF) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipStatus = PIP_OFF
					return this.logFeedback(redeableMsg, 'PIP is OFF ')
				} else if (pipS == PIP_ON) {
					let pipM = parseInt(DAT3)
					if (this.isValidPipMode(pipM)) {
						this.emitConnectionStatusOK()
						this.deviceStatus.pipStatus = PIP_ON
						this.deviceStatus.pipMode = pipM
						return this.logFeedback(redeableMsg, 'PIP is ON, mode:' + PIP_MODE_NAMES[pipM])
					}
				}
			}
		} else if (CMD == '78') {
			if (DAT1 == '00') {
				// 3.2.18 Switch over the pvw screen input source
				let src = parseInt(DAT2)
				if (src >= 0 && src <= 3) {
					this.emitConnectionStatusOK()
					this.deviceStatus.previewSourceMainChannel = src
					return this.logFeedback(
						redeableMsg,
						'Switch over the preview screen to input source ' + SRC_NAMES[this.deviceStatus.previewSourceMainChannel]
					)
				}
			} else if (DAT1 == '01') {
				// 3.2.19 Switch over the pgm screen input source
				let src = parseInt(DAT2)
				if (src >= 0 && src <= 3) {
					this.emitConnectionStatusOK()
					this.deviceStatus.programSourceMainChannel = src
					return this.logFeedback(
						redeableMsg,
						'Switch over the program screen to input source ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel]
					)
				}
			} else if (DAT1 == '02') {
				// 3.2.20
				let mode = parseInt(DAT2)
				if (mode == PIP_OFF) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipStatus = mode
					this.deviceStatus.programSourceMainChannel = parseInt(DAT3)
					return this.logFeedback(
						redeableMsg,
						'PIP is OFF, with main channel ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel]
					)
				} else if (mode == PIP_ON) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipStatus = mode
					this.deviceStatus.programSourceMainChannel = parseInt(DAT3)
					this.deviceStatus.programSourceSubChannel = parseInt(DAT3)
					return this.logFeedback(
						redeableMsg,
						'PIP is ON, with main channel ' +
							SRC_NAMES[this.deviceStatus.programSourceMainChannel] +
							' and sub-channel ' +
							SRC_NAMES[this.deviceStatus.programSourceSubChannel]
					)
				}
			}
		} else if (CMD == 'C7') {
			if (DAT1 == '00' || DAT1 == '01') {
				// 3.2.44 Waveform diagram, vector diagram, and histogram:
				let type = parseInt(DAT2)
				let visibility = parseInt(DAT3)
				let position = parseInt(DAT4)
				if (
					this.isDiagramTypeValid(type) &&
					this.isDiagramVisibilityValid(visibility) &&
					this.isDiagramPositionValid(position)
				) {
					this.emitConnectionStatusOK()
					this.deviceStatus.diagram.type = type
					this.deviceStatus.diagram.visibility = visibility
					this.deviceStatus.diagram.position = position
					return this.logFeedback(
						redeableMsg,
						'Diagram visibility: ' +
							DIAGRAM_VISIBILITY_NAMES[visibility] +
							', type: ' +
							DIAGRAM_TYPE_NAMES[type] +
							', position:' +
							DIAGRAM_POSITION_NAMES[position]
					)
				}
			}
		}

		this.debug('Unrecognized feedback message:' + redeableMsg)
	}

	logFeedback(redeableMsg, info) {
		this.debug('Feedback:' + redeableMsg + ' ' + info)
	}

	emitConnectionStatusOK() {
		this.emit(this.EVENT_NAME_ON_CONNECTION_OK, [])
	}
}

module.exports.RGBLinkTAO1ProConnector = RGBLinkTAO1ProConnector

module.exports.SRC_HDMI1 = SRC_HDMI1
module.exports.SRC_HDMI2 = SRC_HDMI2
module.exports.SRC_UVC1 = SRC_UVC1
module.exports.SRC_UVC2 = SRC_UVC2
module.exports.SRC_NAMES = SRC_NAMES

module.exports.PIP_OFF = PIP_OFF
module.exports.PIP_ON = PIP_ON
module.exports.PIP_STATUES_NAMES = PIP_STATUES_NAMES

module.exports.PIP_MODE_TOP_LEFT = PIP_MODE_TOP_LEFT
module.exports.PIP_MODE_TOP_RIGHT = PIP_MODE_TOP_RIGHT
module.exports.PIP_MODE_BOTTOM_LEFT = PIP_MODE_BOTTOM_LEFT
module.exports.PIP_MODE_BOTTOM_RIGHT = PIP_MODE_BOTTOM_RIGHT
module.exports.PIP_MODE_NAMES = PIP_MODE_NAMES

module.exports.DIAGRAM_TYPE_HISTOGRAM = DIAGRAM_TYPE_HISTOGRAM
module.exports.DIAGRAM_TYPE_VECTOR_DIAGRAM = DIAGRAM_TYPE_VECTOR_DIAGRAM
module.exports.DIAGRAM_TYPE_WAVEFORM_LUMINANCE = DIAGRAM_TYPE_WAVEFORM_LUMINANCE
module.exports.DIAGRAM_TYPE_WAVEFORM_RGB = DIAGRAM_TYPE_WAVEFORM_RGB
module.exports.DIAGRAM_TYPE_NAMES = DIAGRAM_TYPE_NAMES

module.exports.DIAGRAM_VISIBILITY_OFF = DIAGRAM_VISIBILITY_OFF
module.exports.DIAGRAM_VISIBILITY_OPEN = DIAGRAM_VISIBILITY_OPEN
module.exports.DIAGRAM_VISIBILITY_NAMES = DIAGRAM_VISIBILITY_NAMES

module.exports.DIAGRAM_POSITION_MIDDLE_DEFAULT = DIAGRAM_POSITION_MIDDLE_DEFAULT
module.exports.DIAGRAM_POSITION_MIDDLE_MAXIMUM = DIAGRAM_POSITION_MIDDLE_MAXIMUM
module.exports.DIAGRAM_POSITION_BOTTOM_LEFT = DIAGRAM_POSITION_BOTTOM_LEFT
module.exports.DIAGRAM_POSITION_BOTTOM_RIGHT = DIAGRAM_POSITION_BOTTOM_RIGHT
module.exports.DIAGRAM_POSITION_TOP_LEFT = DIAGRAM_POSITION_TOP_LEFT
module.exports.DIAGRAM_POSITION_TOP_RIGHT = DIAGRAM_POSITION_TOP_RIGHT
module.exports.DIAGRAM_POSITION_NAMES = DIAGRAM_POSITION_NAMES
