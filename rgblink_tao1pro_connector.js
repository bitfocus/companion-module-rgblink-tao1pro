const RGBLinkApiConnector = require('./rgblinkapiconnector')

const SRC_HDMI1 = 0
const SRC_HDMI2 = 1
const SRC_UVC1 = 2
const SRC_UVC2 = 3
const SRC_NAMES = {
	0: 'HDMI 1',
	1: 'HDMI 2',
	2: 'UVC 1',
	3: 'UVC 2',
}

const PIP_OFF = 0
const PIP_ON = 1
const PIP_MODE_NAMES = {
	PIP_OFF: 'Normal mode (PIP OFF)',
	PIP_ON: 'PIP mode',
}

class RGBLinkTAO1ProConnector extends RGBLinkApiConnector {
	EVENT_NAME_ON_DEVICE_STATE_CHANGED = 'on_device_state_changed'

	deviceStatus = {
		previewSourceMainChannel: undefined,
		programSourceMainChannel: undefined,
		programSourceSubChannel: undefined,
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

	isValidSource(src) {
		return (src >= 0 && src <= 3)
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

		if (CMD == '78') {
			if (DAT1 == '00') {
				let src = parseInt(DAT2)
				if (src >= 0 && src <= 3) {
					this.emitConnectionStatusOK()
					this.deviceStatus.previewSourceMainChannel = src
					return this.logFeedback(redeableMsg, 'Switch over the preview screen to input source ' + SRC_NAMES[this.deviceStatus.previewSourceMainChannel])
				}
			} else if (DAT1 == '01') {
				let src = parseInt(DAT2)
				if (src >= 0 && src <= 3) {
					this.emitConnectionStatusOK()
					this.deviceStatus.programSourceMainChannel = src
					return this.logFeedback(redeableMsg, 'Switch over the program screen to input source ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel])
				}
			} else if (DAT1 == '02') {
				let mode = parseInt(DAT2)
				if (mode == PIP_OFF) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipMode = mode
					this.deviceStatus.programSourceMainChannel = parseInt(DAT3)
					return this.logFeedback(redeableMsg, 'PIP is OFF, with main channel ' + SRC_NAMES[this.deviceStatus.programSourceMainChannel])
				} else if (mode == PIP_ON) {
					this.emitConnectionStatusOK()
					this.deviceStatus.pipMode = mode
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
module.exports.PIP_MODE_NAMES = PIP_MODE_NAMES