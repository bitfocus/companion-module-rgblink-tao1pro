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
PIP_MODE_NAMES[PIP_MODE_TOP_LEFT] = 'top left'
PIP_MODE_NAMES[PIP_MODE_TOP_RIGHT] = 'top right'
PIP_MODE_NAMES[PIP_MODE_BOTTOM_LEFT] = 'bottom left'
PIP_MODE_NAMES[PIP_MODE_BOTTOM_RIGHT] = 'bottom right'


class RGBLinkTAO1ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		previewSourceMainChannel: undefined,
		programSourceMainChannel: undefined,
		programSourceSubChannel: undefined,
		pipStatus: undefined,
		pipMode: undefined,
	}

	constructor(host, port, debug, polling) {
		super(host, port, debug, polling)
		var self = this

		this.on(this.EVENT_NAME_ON_DATA_API_NOT_STANDARD_LENGTH, (message/*, metadata*/) => {
			this.debug("Not standard data:" + message)
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

	isValidSource(src) {
		return (src >= 0 && src <= 3)
	}

	isValidPipMode(pipMode) {
		return (pipMode == PIP_MODE_TOP_LEFT || pipMode == PIP_MODE_TOP_RIGHT || pipMode == PIP_MODE_BOTTOM_LEFT || pipMode == PIP_MODE_BOTTOM_RIGHT)
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
					return this.logFeedback(redeableMsg, 'Switch over the preview screen to input source ' + SRC_NAMES[this.deviceStatus.previewSourceMainChannel])
				}
			} else if (DAT1 == '01') {
				// 3.2.19 Switch over the pgm screen input source
				let src = parseInt(DAT2)
				if (src >= 0 && src <= 3) {
					this.emitConnectionStatusOK()
					this.deviceStatus.programSourceMainChannel = src
					return this.logFeedback(redeableMsg, 'Switch over the program screen to input source ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel])
				}
			} else if (DAT1 == '02') {
				// 3.2.20
				let mode = parseInt(DAT2)
				if (mode == PIP_OFF) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipStatus = mode
					this.deviceStatus.programSourceMainChannel = parseInt(DAT3)
					return this.logFeedback(redeableMsg, 'PIP is OFF, with main channel ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel])
				} else if (mode == PIP_ON) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipStatus = mode
					this.deviceStatus.programSourceMainChannel = parseInt(DAT3)
					this.deviceStatus.programSourceSubChannel = parseInt(DAT3)
					return this.logFeedback(redeableMsg, 'PIP is ON, with main channel ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel] + ' and sub-channel ' + SRC_NAMES[this.deviceStatus.programSourceSubChannel])
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
