/*
maybe in future
* support DATABLOCK in API + validate checksum and length

usefull commands
* yarn format
* yarn headless
* yarn dev-headless

*/

const instance_skel = require('../../instance_skel')

const {
	RGBLinkTAO1ProConnector,
	SRC_HDMI1,
	SRC_NAMES,
} = require('./rgblink_tao1pro_connector.js')

var DEFAULT_1PRO_PORT = 5560

const ACTION_SWITCH_PREVIEW = 'switch_preview'
const ACTION_SWITCH_PROGRAM = 'switch_program'

const FEEDBKACK_PREVIEW_SRC = 'feedback_preview'
const FEEDBKACK_PROGRAM_SRC = 'feedback_program'

const CHOICES_PART_SOURCES = []
for (let id in SRC_NAMES) {
	CHOICES_PART_SOURCES.push({ id: id, label: SRC_NAMES[id] })
}

class instance extends instance_skel {
	BACKGROUND_COLOR_GREEN
	BACKGROUND_COLOR_RED
	BACKGROUND_COLOR_DEFAULT
	TEXT_COLOR
	apiConnector = new RGBLinkTAO1ProConnector() //creation should be overwrited in init()

	constructor(system, id, config) {
		super(system, id, config)
		this.BACKGROUND_COLOR_GREEN = this.rgb(0, 128, 0)
		this.BACKGROUND_COLOR_RED = this.rgb(255, 0, 0)
		this.BACKGROUND_COLOR_DEFAULT = this.rgb(0, 0, 0)
		this.TEXT_COLOR = this.rgb(255, 255, 255)
		this.initActions()
		this.initPresets()
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'IP address of TAO 1pro device',
				width: 12,
				regex: this.REGEX_IP,
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Port',
				value: 'Will be used default port ' + DEFAULT_1PRO_PORT,
			},
			{
				type: 'checkbox',
				label: 'Status polling (ask for status every second)',
				id: 'polling',
				width: 12,
				default: true,
			},
		]
	}

	destroy() {
		this.debug('RGBlink TAO1 pro: destroy')
		this.apiConnector.sendDisconnectMessage()
		this.apiConnector.onDestroy()
		this.debug('destroy', this.id)
	}

	init() {
		try {
			this.debug('RGBlink TAO1 pro: init')
			this.initApiConnector()
			this.initFeedbacks()
		} catch (ex) {
			this.status(this.STATUS_ERROR, ex)
			this.debug(ex)
		}
	}

	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkTAO1ProConnector(this.config.host, DEFAULT_1PRO_PORT, this.debug, this.config.polling)
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, () => {
			self.checkAllFeedbacks()
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_OK, (message) => {
			self.status(self.STATUS_OK, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_WARNING, (message) => {
			self.status(self.STATUS_WARNING, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_ERROR, (message) => {
			self.status(self.STATUS_ERROR, message)
		})
		this.status(this.STATUS_WARNING, 'Connecting')
		this.apiConnector.sendConnectMessage()
		this.apiConnector.askAboutStatus()
	}

	initActions() {
		let actions = {}

		actions[ACTION_SWITCH_PREVIEW] = {
			label: 'Switch source on preview',
			options: [
				{
					type: 'dropdown',
					label: 'Source signal',
					id: 'source',
					default: SRC_HDMI1,
					tooltip: 'Choose input source signal',
					choices: CHOICES_PART_SOURCES,
					minChoicesForSearch: 0,
				},
			],
			callback: (action /*, bank*/) => {
				this.apiConnector.sendSwitchPreview(action.options.source)
			},
		}

		actions[ACTION_SWITCH_PROGRAM] = {
			label: 'Switch source on program',
			options: [
				{
					type: 'dropdown',
					label: 'Source signal',
					id: 'source',
					default: SRC_HDMI1,
					tooltip: 'Choose input source signal',
					choices: CHOICES_PART_SOURCES,
					minChoicesForSearch: 0,
				},
			],
			callback: (action /*, bank*/) => {
				this.apiConnector.sendSwitchProgram(action.options.source)
			},
		}

		this.setActions(actions)
	}

	checkAllFeedbacks() {
		this.checkFeedbacks(FEEDBKACK_PREVIEW_SRC)
		this.checkFeedbacks(FEEDBKACK_PROGRAM_SRC)
	}

	updateConfig(config) {
		this.debug('RGBlink TAO1 pro: updateConfig')
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			this.apiConnector.createSocket(config.host, DEFAULT_1PRO_PORT)
		}

		this.apiConnector.setPolling(config.polling)
	}

	feedback(feedback /*, bank*/) {
		if (feedback.type == FEEDBKACK_PREVIEW_SRC) {
			return feedback.options.source == this.apiConnector.deviceStatus.previewSourceMainChannel
		} else if (feedback.type == FEEDBKACK_PROGRAM_SRC) {
			return feedback.options.source == this.apiConnector.deviceStatus.programSourceMainChannel
		}

		return false
	}

	initFeedbacks() {
		const feedbacks = {}

		feedbacks[FEEDBKACK_PREVIEW_SRC] = {
			type: 'boolean',
			label: 'Selected source on preview',
			description: 'Feedback, if selected source is used on preview',
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_GREEN,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Source signal',
					id: 'source',
					default: SRC_HDMI1,
					tooltip: 'Choose input source signal',
					choices: CHOICES_PART_SOURCES,
					minChoicesForSearch: 0,
				},
			],
		}

		feedbacks[FEEDBKACK_PROGRAM_SRC] = {
			type: 'boolean',
			label: 'Selected source on program',
			description: 'Feedback, if selected source is used on program',
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Source signal',
					id: 'source',
					default: SRC_HDMI1,
					tooltip: 'Choose input source signal',
					choices: CHOICES_PART_SOURCES,
					minChoicesForSearch: 0,
				},
			],
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		let presets = []

		for (let id in SRC_NAMES) {
			presets.push({
				category: 'Switch source on preview',
				bank: {
					style: 'text',
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
				},
				actions: [
					{
						action: ACTION_SWITCH_PREVIEW,
						options: {
							source: id,
						},
					},
				],
				feedbacks: [
					{
						type: FEEDBKACK_PREVIEW_SRC,
						options: {
							source: id,
						},
						style: {
							color: this.TEXT_COLOR,
							bgcolor: this.BACKGROUND_COLOR_GREEN,
						},
					},
				],
			})
		}

		for (let id in SRC_NAMES) {
			presets.push({
				category: 'Switch source on program',
				bank: {
					style: 'text',
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
				},
				actions: [
					{
						action: ACTION_SWITCH_PROGRAM,
						options: {
							source: id,
						},
					},
				],
				feedbacks: [
					{
						type: FEEDBKACK_PROGRAM_SRC,
						options: {
							source: id,
						},
						style: {
							color: this.TEXT_COLOR,
							bgcolor: this.BACKGROUND_COLOR_RED,
						},
					},
				],
			})

		}

		this.setPresetDefinitions(presets)
	}
}

exports = module.exports = instance
